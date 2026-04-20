export const savingTips = [
  "La regla del 50/30/20: 50% para necesidades, 30% para gustos y 20% para ahorro.",
  "Evita los 'gastos hormiga': esos pequeños cafés o snacks diarios suman mucho al mes.",
  "Antes de una compra impulsiva, espera 24 horas. Si aún lo quieres, cómpralo.",
  "Págate a ti mismo primero: separa tu ahorro apenas recibas tu ingreso.",
  "Revisa tus suscripciones: cancela lo que no hayas usado en los últimos 30 días.",
  "Pequeños ahorros hoy construyen grandes fortunas mañana.",
  "El mejor momento para empezar a ahorrar fue ayer, el segundo mejor es hoy.",
  "Planifica tus compras con una lista; ir al súper con hambre sale más caro.",
  "Ahorrar no es solo guardar dinero, es cuidar tu libertad futura.",
  "Automatiza tu ahorro: lo que no ves, no te dan ganas de gastarlo."
];

export const getRandomTip = () => {
  return savingTips[Math.floor(Math.random() * savingTips.length)];
};
