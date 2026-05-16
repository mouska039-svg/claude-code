import { StyleSheet } from "@react-pdf/renderer"

export const colors = {
  primary: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#f8fafc",
  white: "#ffffff",
}

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.text,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerBrand: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  headerDate: {
    fontSize: 9,
    color: colors.muted,
  },
  // Title block
  titleBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
  },
  // Section
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Cards / boxes
  card: {
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  // Row
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  // Text
  body: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  muted: {
    fontSize: 9,
    color: colors.muted,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  // Table
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    alignItems: "flex-start",
  },
  tableHeader: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
  // Bullet list
  bulletItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    color: colors.primary,
    fontSize: 10,
  },
})
