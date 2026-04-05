package com.repmate.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * OWASP Rate Limiting Filter (OWASP A05:2021 – Security Misconfiguration)
 *
 * Limits:
 *   - POST /api/auth/login    → 10 req/min per IP  (brute-force protection)
 *   - POST /api/auth/register → 5  req/min per IP  (account-creation spam)
 *   - All other /api/**       → 60 req/min per IP  (general DoS protection)
 *
 * Implementation: Bucket4j token-bucket algorithm + Caffeine LRU cache.
 * Buckets auto-expire after 10 minutes of inactivity to prevent memory leaks.
 * Returns HTTP 429 with a JSON body and a Retry-After header.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // ── Caffeine caches: key = "<ip>:<bucket-group>", value = token Bucket ──
    private final Cache<String, Bucket> authLoginCache = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(5_000)
            .build();

    private final Cache<String, Bucket> authRegisterCache = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(5_000)
            .build();

    private final Cache<String, Bucket> generalCache = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(20_000)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String ip  = getClientIp(request);
        String uri = request.getRequestURI();
        String method = request.getMethod();

        Bucket bucket = resolveBucket(ip, uri, method);

        if (bucket.tryConsume(1)) {
            // Token available — allow request to proceed
            filterChain.doFilter(request, response);
        } else {
            // No tokens left — return 429 Too Many Requests
            sendTooManyRequests(response);
        }
    }

    // ── Bucket factory ───────────────────────────────────────────────────────

    private Bucket resolveBucket(String ip, String uri, String method) {
        if ("POST".equalsIgnoreCase(method) && uri.equals("/api/auth/login")) {
            // 10 requests per minute — brute-force protection
            return authLoginCache.get(ip, k -> newBucket(10, Duration.ofMinutes(1)));

        } else if ("POST".equalsIgnoreCase(method) && uri.equals("/api/auth/register")) {
            // 5 requests per minute — account-creation spam protection
            return authRegisterCache.get(ip, k -> newBucket(5, Duration.ofMinutes(1)));

        } else {
            // 60 requests per minute — general authenticated API calls
            return generalCache.get(ip, k -> newBucket(60, Duration.ofMinutes(1)));
        }
    }

    /**
     * Creates a greedy-refill token bucket using the Bucket4j 8.x BandwidthBuilder API.
     * Greedy refill smoothly distributes tokens over the window (prevents burst abuse).
     */
    private Bucket newBucket(long capacity, Duration period) {
        // Bucket4j 8.x API: BandwidthBuilder replaces deprecated Bandwidth.classic()
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, period)
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Extracts the real client IP, respecting common reverse-proxy headers.
     * Falls back to getRemoteAddr() when no proxy header is present.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For can be a comma-separated list; take the first
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    /** Writes a structured JSON 429 response with a Retry-After header. */
    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // OWASP: always include Retry-After on rate-limit responses
        response.setHeader("Retry-After", "60");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "error",   "Too many requests",
                "message", "Rate limit exceeded. Please wait before retrying.",
                "status",  429
        ));
    }

    /**
     * Skip rate limiting for non-API paths (static resources, actuator, etc.)
     * so only /api/** is affected.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !uri.startsWith("/api/");
    }
}
