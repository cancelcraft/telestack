
export function rangeTranslation(index, target, inversion) {

  // This will turn -1 and 1, into -1 and 0.
  inversion = (inversion - 1) / 2

  // Do this to avoid dividing by zero.
  const operationalTarget = Math.abs(target) + 1

  // There should never be negative index. Offseting by one to accord with target offset.
  const operationalIndex = index + 1

  // If index is less than target, yields zero. If index is greater than target, yields 1 or more.
  const retVal = Math.trunc(operationalIndex / operationalTarget)

  // If index is less than target, yields one. If index is greater than target, yields zero.
  // If index is equal to target, yields zero.
  const result = Math.trunc(1 / Math.pow(2, retVal))

  // If the caller desires zeroes followed by ones, add the inversion which is either zero or negative one.
  return Math.abs(result + inversion)
}

/**
  Current implementation include lower index, but excludes upper
  Some cases would want to exclude lower, but include upper.

  The behavior really changes when upper is truly above lower,
  because the index offset should be negative, and it should be shifted up a notch.

  In order to known if we want upper inclusive or exclusive, we need to know the sign.

  What happens if they equal each other?

  I can multiply all the values by negative one, and shift them up by the value.
  I can do the first part mathematically with ease - less so the second part.

  Everything should be sign driven.
 */
export function overlappingRangeTranslation(index, either, or) {

  if (either === or) {
    return 0
  }

  // Will produce NaN if either equals or, because or minus either is 0.
  const sign = (or - either) / Math.abs(or - either)
  const altSign = (either - or) / Math.abs(either - or)

  return determineIdentityForPositionBetweenBounds(index, either, or, sign)
}

export function determineIdentityForPositionBetweenBounds(index, boundOne, boundTwo, sign) {
  const altSign = sign * -1

  return rangeTranslation(index, boundTwo, sign) * rangeTranslation(index, boundOne, altSign)
}
