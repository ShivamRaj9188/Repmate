package com.repmate.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.repmate.backend.model.DietPlan;
import com.repmate.backend.model.User;
import com.repmate.backend.repository.DietPlanRepository;
import com.repmate.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DietPlanService {

    private final DietPlanRepository dietPlanRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public DietPlanService(DietPlanRepository dietPlanRepository, UserRepository userRepository) {
        this.dietPlanRepository = dietPlanRepository;
        this.userRepository = userRepository;
    }

    // ─── TDEE Calculation (Harris-Benedict Revised) ───────────────────────────

    public int calculateTDEE(User user) {
        if (user.getWeightKg() == null || user.getHeightCm() == null || user.getAge() == null) {
            return 2000; // sensible default
        }

        double weight = user.getWeightKg().doubleValue();
        double height = user.getHeightCm().doubleValue();
        int    age    = user.getAge();
        String gender = user.getGender() != null ? user.getGender().toUpperCase() : "MALE";

        double bmr;
        if ("FEMALE".equals(gender)) {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        } else {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        }

        double activityMultiplier = activityMultiplier(user.getActivityLevel());
        return (int) Math.round(bmr * activityMultiplier);
    }

    public int calculateTargetCalories(int tdee, String fitnessGoal) {
        if (fitnessGoal == null) return tdee;
        return switch (fitnessGoal.toUpperCase()) {
            case "WEIGHT_LOSS"  -> tdee - 500;
            case "MUSCLE_GAIN"  -> tdee + 300;
            case "ENDURANCE"    -> tdee + 100;
            default             -> tdee;
        };
    }

    // ─── Plan Generation ──────────────────────────────────────────────────────

    public DietPlan generateOrRefreshPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int tdee    = calculateTDEE(user);
        int target  = calculateTargetCalories(tdee, user.getFitnessGoal());
        String diet = user.getDietPreference() != null ? user.getDietPreference().toUpperCase() : "NO_PREFERENCE";

        List<Map<String, Object>> weekPlan = buildWeekPlan(target, diet);

        try {
            String planJson = objectMapper.writeValueAsString(weekPlan);
            DietPlan plan = DietPlan.builder()
                    .user(user)
                    .generatedAt(LocalDateTime.now())
                    .tdee(tdee)
                    .targetCalories(target)
                    .planJson(planJson)
                    .build();
            return dietPlanRepository.save(plan);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialise diet plan", e);
        }
    }

    public Optional<DietPlan> getLatestPlan(Long userId) {
        return dietPlanRepository.findTopByUserIdOrderByGeneratedAtDesc(userId);
    }

    // ─── Meal Templates ───────────────────────────────────────────────────────

    private List<Map<String, Object>> buildWeekPlan(int targetCalories, String diet) {
        String[] days = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};
        List<Map<String, Object>> week = new ArrayList<>();

        // Macro splits: protein=30%, carbs=45%, fat=25%
        int proteinCals = (int)(targetCalories * 0.30);
        int carbCals    = (int)(targetCalories * 0.45);
        int fatCals     = (int)(targetCalories * 0.25);
        int proteinG    = proteinCals / 4;
        int carbG       = carbCals / 4;
        int fatG        = fatCals / 9;

        List<List<Map<String, Object>>> breakfasts = getMealTemplates("breakfast", diet, targetCalories);
        List<List<Map<String, Object>>> lunches    = getMealTemplates("lunch",     diet, targetCalories);
        List<List<Map<String, Object>>> dinners    = getMealTemplates("dinner",    diet, targetCalories);
        List<List<Map<String, Object>>> snacks     = getMealTemplates("snack",     diet, targetCalories);

        Random rng = new Random();

        for (int i = 0; i < 7; i++) {
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("day", days[i]);
            day.put("totalCalories", targetCalories);
            day.put("macros", Map.of(
                "proteinG", proteinG, "carbG", carbG, "fatG", fatG
            ));
            day.put("breakfast", breakfasts.get(rng.nextInt(breakfasts.size())));
            day.put("lunch",     lunches.get(rng.nextInt(lunches.size())));
            day.put("dinner",    dinners.get(rng.nextInt(dinners.size())));
            day.put("snack",     snacks.get(rng.nextInt(snacks.size())));
            week.add(day);
        }
        return week;
    }

    /** Returns a list of meal options for the given meal type + diet. */
    private List<List<Map<String, Object>>> getMealTemplates(String meal, String diet, int totalCals) {
        // Approximate calorie splits: breakfast=25%, lunch=35%, dinner=30%, snack=10%
        double split = switch (meal) {
            case "breakfast" -> 0.25;
            case "lunch"     -> 0.35;
            case "dinner"    -> 0.30;
            default          -> 0.10;
        };
        int mealCals = (int)(totalCals * split);

        return switch (diet) {
            case "VEGAN"       -> veganMeals(meal, mealCals);
            case "VEGETARIAN"  -> vegetarianMeals(meal, mealCals);
            case "KETO"        -> ketoMeals(meal, mealCals);
            default            -> nonVegMeals(meal, mealCals);
        };
    }

    private List<List<Map<String, Object>>> nonVegMeals(String meal, int cal) {
        int p = cal / 4, c = cal / 4, f = cal / 9;
        return switch (meal) {
            case "breakfast" -> List.of(
                meal("Egg whites + whole-grain toast + avocado", cal, p, c, f),
                meal("Greek yogurt parfait with granola & berries", cal, p, c, f),
                meal("Chicken omelette with spinach & cheese", cal, p, c, f)
            );
            case "lunch" -> List.of(
                meal("Grilled chicken salad with quinoa", cal, p, c, f),
                meal("Turkey wrap with leafy greens & hummus", cal, p, c, f),
                meal("Tuna sandwich on whole-grain bread", cal, p, c, f)
            );
            case "dinner" -> List.of(
                meal("Baked salmon with sweet potato & broccoli", cal, p, c, f),
                meal("Chicken stir-fry with brown rice & vegetables", cal, p, c, f),
                meal("Beef & vegetable curry with basmati rice", cal, p, c, f)
            );
            default -> List.of(
                meal("Handful of almonds + apple", cal, p, c, f),
                meal("Cottage cheese with cucumber", cal, p, c, f),
                meal("Protein shake with banana", cal, p, c, f)
            );
        };
    }

    private List<List<Map<String, Object>>> vegetarianMeals(String meal, int cal) {
        int p = cal / 4, c = cal / 4, f = cal / 9;
        return switch (meal) {
            case "breakfast" -> List.of(
                meal("Masala oats with boiled egg", cal, p, c, f),
                meal("Vegetable poha with peanuts", cal, p, c, f),
                meal("Paneer bhurji with whole-wheat toast", cal, p, c, f)
            );
            case "lunch" -> List.of(
                meal("Dal makhani with brown rice & salad", cal, p, c, f),
                meal("Paneer tikka wrap with mint chutney", cal, p, c, f),
                meal("Rajma with chapati & cucumber raita", cal, p, c, f)
            );
            case "dinner" -> List.of(
                meal("Palak paneer with whole-wheat roti", cal, p, c, f),
                meal("Vegetable khichdi with papad", cal, p, c, f),
                meal("Mixed dal with quinoa pulao", cal, p, c, f)
            );
            default -> List.of(
                meal("Handful of mixed nuts", cal, p, c, f),
                meal("Greek yogurt with honey", cal, p, c, f),
                meal("Sprouts chaat", cal, p, c, f)
            );
        };
    }

    private List<List<Map<String, Object>>> veganMeals(String meal, int cal) {
        int p = cal / 4, c = cal / 4, f = cal / 9;
        return switch (meal) {
            case "breakfast" -> List.of(
                meal("Tofu scramble with whole-grain toast", cal, p, c, f),
                meal("Overnight oats with chia seeds & banana", cal, p, c, f),
                meal("Smoothie bowl with flaxseeds & berries", cal, p, c, f)
            );
            case "lunch" -> List.of(
                meal("Chickpea salad with quinoa & tahini dressing", cal, p, c, f),
                meal("Black bean tacos with guacamole", cal, p, c, f),
                meal("Lentil soup with whole-grain bread", cal, p, c, f)
            );
            case "dinner" -> List.of(
                meal("Tofu stir-fry with brown rice & edamame", cal, p, c, f),
                meal("Vegan chilli with sweet potato", cal, p, c, f),
                meal("Tempeh buddha bowl with roasted vegetables", cal, p, c, f)
            );
            default -> List.of(
                meal("Handful of walnuts + dates", cal, p, c, f),
                meal("Hummus with carrot sticks", cal, p, c, f),
                meal("Peanut butter on rice cakes", cal, p, c, f)
            );
        };
    }

    private List<List<Map<String, Object>>> ketoMeals(String meal, int cal) {
        int p = (int)(cal * 0.30 / 4), c = (int)(cal * 0.05 / 4), f = (int)(cal * 0.65 / 9);
        return switch (meal) {
            case "breakfast" -> List.of(
                meal("Eggs & bacon with avocado", cal, p, c, f),
                meal("Full-fat Greek yogurt with almonds & berries", cal, p, c, f),
                meal("Cheese omelette with spinach & butter", cal, p, c, f)
            );
            case "lunch" -> List.of(
                meal("Zucchini noodles with pesto & chicken", cal, p, c, f),
                meal("Caesar salad with grilled chicken (no croutons)", cal, p, c, f),
                meal("Tuna stuffed avocado", cal, p, c, f)
            );
            case "dinner" -> List.of(
                meal("Ribeye steak with cauliflower mash & butter", cal, p, c, f),
                meal("Baked salmon with asparagus & olive oil", cal, p, c, f),
                meal("Pork belly with roasted Brussels sprouts", cal, p, c, f)
            );
            default -> List.of(
                meal("Cheese cubes + olives", cal, p, c, f),
                meal("Macadamia nuts", cal, p, c, f),
                meal("Pepperoni slices with cream cheese", cal, p, c, f)
            );
        };
    }

    private List<Map<String, Object>> meal(String name, int cal, int proteinG, int carbG, int fatG) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("calories", cal);
        m.put("proteinG", proteinG);
        m.put("carbG", carbG);
        m.put("fatG", fatG);
        return List.of(m);
    }

    private double activityMultiplier(String level) {
        if (level == null) return 1.375;
        return switch (level.toUpperCase()) {
            case "SEDENTARY"          -> 1.2;
            case "LIGHTLY_ACTIVE"     -> 1.375;
            case "MODERATELY_ACTIVE"  -> 1.55;
            case "VERY_ACTIVE"        -> 1.725;
            default                   -> 1.375;
        };
    }
}
