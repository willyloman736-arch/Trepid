'use client'

import { motion } from 'framer-motion'
import { useAnimatedNumber } from '@/hooks/useMicroAnimation'

/* ============================================================
   AnimatedNumber — springs smoothly from the old value to the
   new value whenever `value` changes. Use for discipline score,
   trade counts, dollar amounts, etc.
   ============================================================ */

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  className?: string
  style?: React.CSSProperties
}

export function AnimatedNumber({
  value,
  format = (n) => n.toString(),
  className,
  style,
}: AnimatedNumberProps) {
  const spring = useAnimatedNumber(value)
  return (
    <motion.span className={className} style={style}>
      {useFormatter(spring, format)}
    </motion.span>
  )
}

/* Small helper: returns a MotionValue transformed through format() */
import { useTransform, type MotionValue } from 'framer-motion'
function useFormatter(mv: MotionValue<number>, format: (n: number) => string) {
  return useTransform(mv, format)
}
