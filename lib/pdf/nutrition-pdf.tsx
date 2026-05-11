import { Document, Page, Text, View } from "@react-pdf/renderer"
import { styles, colors } from "./components/styles"
import type { NutritionPlanOutput } from "@/lib/ai/schemas/nutrition"

interface Props {
  plan: NutritionPlanOutput
  brandName: string
  brandColor?: string
  generatedAt: string
}

export function NutritionPDF({ plan, brandName, brandColor, generatedAt }: Props) {
  const primary = brandColor ?? colors.primary

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: primary }]}>
          <Text style={[styles.headerBrand, { color: primary }]}>{brandName}</Text>
          <Text style={styles.headerDate}>{generatedAt}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.subtitle}>Plan nutritionnel · 7 jours</Text>
        </View>

        {/* Macro stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Calories", value: `${plan.targetCalories} kcal` },
            { label: "Protéines", value: `${plan.targetProtein}g` },
            { label: "Glucides", value: `${plan.targetCarbs}g` },
            { label: "Lipides", value: `${plan.targetFat}g` },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { borderWidth: 1, borderColor: primary + "40" }]}>
              <Text style={[styles.statValue, { color: primary }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        {plan.tips.length > 0 && (
          <View style={[styles.section, { marginBottom: 16 }]}>
            <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary }]}>Conseils</Text>
            {plan.tips.map((tip, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={[styles.bullet, { color: primary }]}>•</Text>
                <Text style={styles.body}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Days */}
        {plan.days.map((day) => (
          <View key={day.day} style={styles.section} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary, flex: 1 }]}>{day.day}</Text>
              <Text style={[styles.muted, { marginBottom: 6 }]}>{day.dailyCalories} kcal</Text>
            </View>

            {day.meals.map((meal) => (
              <View key={meal.name} style={[styles.card, { marginBottom: 6 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={styles.cardTitle}>{meal.name}</Text>
                  <Text style={styles.muted}>{meal.time} · {meal.totalCalories} kcal</Text>
                </View>
                {meal.foods.map((food, fi) => (
                  <View key={fi} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={styles.body}>{food.food} ({food.quantity})</Text>
                    <Text style={styles.muted}>{food.calories} kcal</Text>
                  </View>
                ))}
                <View style={[styles.row, { marginTop: 4 }]}>
                  <Text style={styles.muted}>P: {meal.totalProtein}g</Text>
                  <Text style={styles.muted}>G: {meal.totalCarbs}g</Text>
                  <Text style={styles.muted}>L: {meal.totalFat}g</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Shopping list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary }]}>Liste de courses</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {plan.shoppingList.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={[styles.bullet, { color: primary }]}>•</Text>
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{brandName} · Plan nutritionnel généré par IA</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
