"use client";

import { motion } from "motion/react";
import {
  ChartBar,
  Globe,
  BarChart3,
  FileBarChart,
  Activity,
  Map,
  Target,
} from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="bg-background/50 flex h-screen w-full flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-card relative flex flex-col items-center gap-8 rounded-xl p-12 shadow-xl"
      >
        {/* Animated KPI Logo with pulse effect */}
        <motion.div
          className="relative h-28 w-28"
          initial={{ y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="bg-primary/5 absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="bg-primary/10 absolute inset-0 rounded-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileBarChart className="text-primary h-14 w-14" />
          </div>
        </motion.div>

        {/* Loading Text with typewriter effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <h2 className="text-primary text-2xl font-bold tracking-tight">
            Loading KPI Dashboard
          </h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            Preparing your insights and analytics...
          </motion.p>
        </motion.div>

        {/* Circular animated icons */}
        <motion.div
          className="relative mt-4 h-32 w-32"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[Activity, Globe, BarChart3, Map, Target].map((Icon, index) => {
            const angle = index * (360 / 5) * (Math.PI / 180);
            const x = Math.cos(angle) * 60;
            const y = Math.sin(angle) * 60;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2 + index * 0.15,
                  duration: 0.5,
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full p-2"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 0, 0],
                  }}
                  transition={{
                    duration: 2 + index * 0.3,
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <Icon className="text-primary h-6 w-6" />
                </motion.div>
              </motion.div>
            );
          })}

          {/* Center icon */}
          <motion.div
            className="bg-primary/5 absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              backgroundColor: [
                "hsl(var(--primary) / 0.05)",
                "hsl(var(--primary) / 0.1)",
                "hsl(var(--primary) / 0.05)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChartBar className="text-primary h-7 w-7" />
          </motion.div>
        </motion.div>

        {/* Loading progress bar with shine effect */}
        <div className="mt-8 w-64 overflow-hidden">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Loading dashboard</span>
            <motion.span
              className="text-primary font-medium"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Please wait...
            </motion.span>
          </div>
          <motion.div className="bg-primary/10 h-1.5 w-full overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="h-full w-20 bg-white/20"
                animate={{ x: ["0%", "250%"] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
