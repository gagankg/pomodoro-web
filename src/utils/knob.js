export const MIN_ANGLE = -135;
export const MAX_ANGLE = 135;

export function angleToVolume(angle) {
  return (angle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE);
}

export function volumeToAngle(volume) {
  return volume * (MAX_ANGLE - MIN_ANGLE) + MIN_ANGLE;
}

export function logCurve(volume) {
  return Math.pow(volume, 2);
}

export function clampAngle(angle) {
  return Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angle));
}
