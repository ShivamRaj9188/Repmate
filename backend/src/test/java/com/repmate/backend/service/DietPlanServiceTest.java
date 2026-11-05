package com.repmate.backend.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DietPlanServiceTest {

    @ParameterizedTest
    @ValueSource(strings = {"NO_PREFERENCE", "VEGETARIAN", "VEGAN", "KETO"})
    @SuppressWarnings("unchecked")
    void mealMacrosAddUpToDailyTotals(String diet) {
        var week = new DietPlanService(null, null).buildWeekPlan(3000, diet);

        for (Map<String, Object> day : week) {
            Map<String, Integer> totals = (Map<String, Integer>) day.get("macros");
            for (String macro : List.of("proteinG", "carbG", "fatG")) {
                int sum = 0;
                for (String meal : List.of("breakfast", "lunch", "dinner", "snack")) {
                    sum += ((List<Map<String, Integer>>) day.get(meal)).get(0).get(macro);
                }
                // Each of the 4 meals rounds down by under 1g
                int diff = totals.get(macro) - sum;
                assertTrue(diff >= 0 && diff <= 4, diet + " " + macro + ": meals " + sum + " vs day " + totals.get(macro));
            }
        }
    }
}
