import { Document, Page, Text, View } from "@react-pdf/renderer"
import { styles, colors } from "./components/styles"
import type { WorkoutProgramOutput } from "@/lib/ai/schemas/workout"

interface Props {
  program: WorkoutProgramOutput
  brandName: string
  brandColor?: string
  generatedAt: string
}

export function ProgramPDF({ program, brandName, brandColor, generatedAt }: Props) {
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
          <Text style={styles.title}>{program.title}</Text>
          <Text style={styles.subtitle}>
            Programme {program.durationWeeks} semaine{program.durationWeeks > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary }]}>Présentation</Text>
          <Text style={styles.body}>{program.overview}</Text>
        </View>

        {/* Weeks */}
        {program.weeks.map((week) => (
          <View key={week.weekNumber} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary }]}>
              Semaine {week.weekNumber}
            </Text>
            {week.days.map((day, di) => (
              <View key={di} style={[styles.card, { marginBottom: 10 }]} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={styles.cardTitle}>{day.name}</Text>
                  <Text style={[styles.muted, { fontFamily: "Helvetica-Oblique" }]}>{day.focus}</Text>
                </View>

                {/* Table header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.muted, { flex: 3, fontFamily: "Helvetica-Bold" }]}>Exercice</Text>
                  <Text style={[styles.muted, { flex: 1, textAlign: "center", fontFamily: "Helvetica-Bold" }]}>Séries</Text>
                  <Text style={[styles.muted, { flex: 1, textAlign: "center", fontFamily: "Helvetica-Bold" }]}>Reps</Text>
                  <Text style={[styles.muted, { flex: 1, textAlign: "center", fontFamily: "Helvetica-Bold" }]}>Repos</Text>
                </View>

                {day.exercises.map((ex, ei) => (
                  <View key={ei} style={[styles.tableRow, { alignItems: "flex-start" }]}>
                    <View style={{ flex: 3 }}>
                      <Text style={styles.body}>{ex.name}</Text>
                      {ex.notes ? <Text style={styles.muted}>{ex.notes}</Text> : null}
                    </View>
                    <Text style={[styles.body, { flex: 1, textAlign: "center" }]}>{ex.sets}</Text>
                    <Text style={[styles.body, { flex: 1, textAlign: "center" }]}>{ex.reps}</Text>
                    <Text style={[styles.body, { flex: 1, textAlign: "center" }]}>{ex.rest}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Progression notes */}
        {program.progressionNotes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: primary, borderBottomColor: primary }]}>
              Notes de progression
            </Text>
            <Text style={styles.body}>{program.progressionNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{brandName} · Programme généré par IA</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
