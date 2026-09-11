export function formatTiempo(horas: number): string {
  const minutos = Math.round(horas * 60)
  if (minutos < 60) return `hace ${minutos} min`
  if (horas < 24) return `hace ${Math.round(horas)} hs`
  return `hace ${Math.round(horas / 24)} días`
}
