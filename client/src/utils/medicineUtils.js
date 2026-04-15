import api from "./api"
import sampleMedicines from "./sampleMedicines"

export const importSampleMedicines = async () => {
  try {
    const { data: { data: existing = [] } = {} } = await api.get("/medicines")
    const existingNames = new Set(existing.map(m => m.name.trim().toLowerCase()))

    const toImport = sampleMedicines.filter(
      med => !existingNames.has(med.name.trim().toLowerCase())
    )

    if (toImport.length === 0) {
      console.log("All sample medicines already exist")
      return existing
    }

    await Promise.all(toImport.map(med => api.post("/medicines", med)))
    console.log(`Imported ${toImport.length} new sample medicines`)

    const { data: { data: updated = [] } = {} } = await api.get("/medicines")
    return updated
  } catch (err) {
    console.error("Import failed:", err.response?.data?.message || err.message)
    throw err
  }
}

export const isInventoryEmpty = async () => {
  try {
    const { data: { data: list = [] } = {} } = await api.get("/medicines")
    return list.length === 0
  } catch (err) {
    console.error("Check inventory failed:", err)
    return true
  }
}