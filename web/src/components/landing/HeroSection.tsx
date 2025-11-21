import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { t, Language } from '../../i18n/translations'

interface HeroSectionProps {
  language: Language
}

export default function HeroSection({ language }: HeroSectionProps) {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  }
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } },
  }

  return (
    <section className="relative pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6 relative z-10"
            style={{ opacity, scale }}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: 'rgba(240, 185, 11, 0.1)',
                  border: '1px solid rgba(240, 185, 11, 0.2)',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(240, 185, 11, 0.2)',
                }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: 'var(--brand-yellow)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--brand-yellow)' }}
                >
                  🚀 AI Win Rate up to{' '}
                  <span className="inline-block tabular-nums">
                    85.0
                  </span>%
                </span>
              </motion.div>
            </motion.div>

            <h1
              className="text-5xl lg:text-7xl font-bold leading-tight"
              style={{ color: 'var(--brand-light-gray)' }}
            >
              {t('heroTitle1', language)}
              <br />
              <span style={{ color: 'var(--brand-yellow)' }}>
                {t('heroTitle2', language)}
              </span>
            </h1>

            <motion.p
              className="text-xl leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
              variants={fadeInUp}
            >
              {t('heroDescription', language)}
            </motion.p>

            <div className="flex items-center gap-8 flex-wrap pt-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-medium mb-1">{t('activeAgents', language)}</span>
                <span className="text-2xl font-bold text-white">50+</span>
              </div>
              <div className="w-px h-10 bg-gray-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-medium mb-1">{t('totalVolume', language)}</span>
                <span className="text-2xl font-bold text-white">$120M+</span>
              </div>
              <div className="w-px h-10 bg-gray-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-medium mb-1">{t('subscribers', language)}</span>
                <span className="text-2xl font-bold text-white">2.5K</span>
              </div>
            </div>

            <motion.p
              className="text-xs pt-8"
              style={{ color: 'var(--text-tertiary)' }}
              variants={fadeInUp}
            >
              {t('compatibleWith', language)}
            </motion.p>
          </motion.div>

          {/* Right Visual - AI Trading K-Line */}
          <motion.div
            className="relative w-full flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-lg"
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 blur-3xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, var(--brand-yellow) 0%, transparent 70%)',
                  transform: 'scale(0.8)',
                }}
              />

              <img
                src="/images/ai-trading-kline.svg"
                alt="AI Trading Analysis"
                className="w-full h-auto relative z-10 drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
