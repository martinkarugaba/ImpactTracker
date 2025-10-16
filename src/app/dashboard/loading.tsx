"use client";

import { motion } from "motion/react";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col items-center space-y-8">
        {/* Main logo with sophisticated animation */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg"
            animate={{
              boxShadow: [
                "0 4px 20px rgba(0, 0, 0, 0.1)",
                "0 8px 40px rgba(var(--primary-rgb), 0.2)",
                "0 4px 20px rgba(0, 0, 0, 0.1)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <BarChart3 className="h-10 w-10 text-primary-foreground" />
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-primary/60"
              style={{
                top: `${20 + i * 15}%`,
                left: `${85 + i * 5}%`,
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading text with smooth entrance */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
            Loading Dashboard
          </h1>
          <motion.p
            className="text-muted-foreground"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Preparing your analytics experience
          </motion.p>
        </motion.div>

        {/* Modern progress indicator */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full bg-primary/30"
                animate={{
                  backgroundColor: [
                    "hsl(var(--primary) / 0.3)",
                    "hsl(var(--primary) / 1)",
                    "hsl(var(--primary) / 0.3)",
                  ],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating feature icons */}
        <motion.div
          className="flex space-x-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
        >
          {[
            { icon: TrendingUp, delay: 0 },
            { icon: Activity, delay: 0.2 },
            { icon: BarChart3, delay: 0.4 },
          ].map(({ icon: Icon, delay }, i) => (
            <motion.div
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 backdrop-blur-sm"
              animate={{
                y: [0, -8, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle loading bar */}
        <motion.div
          className="w-48 overflow-hidden rounded-full bg-muted/30"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "12rem" }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="h-1 bg-gradient-to-r from-primary/60 to-primary"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
