"use client";

import { motion } from "framer-motion";

export interface CodeApplicationState {
  stage: 'analyzing' | 'installing' | 'applying' | 'complete' | null;
  packages?: string[];
  installedPackages?: string[];
  filesGenerated?: string[];
}

interface CodeApplicationProgressProps {
  state: CodeApplicationState;
}

export default function CodeApplicationProgress({ state }: CodeApplicationProgressProps) {
  if (!state.stage || state.stage === 'complete') return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center max-w-md px-8"
      >
        {/* Animated Icon */}
        <div className="mb-8">
          {state.stage === 'analyzing' && (
            <motion.div
              className="w-16 h-16 mx-auto relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 border-4 border-[#8b7355] border-t-transparent rounded-full" />
              <div className="absolute inset-2 border-2 border-[#8b7355]/50 border-b-transparent rounded-full" />
            </motion.div>
          )}
          
          {state.stage === 'installing' && (
            <motion.div
              className="w-16 h-16 mx-auto relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-full h-full text-[#8b7355]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </motion.div>
          )}
          
          {state.stage === 'applying' && (
            <motion.div className="w-16 h-16 mx-auto relative">
              <motion.div
                className="absolute inset-0 bg-[#8b7355]/20 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#8b7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>

        {/* Status Text */}
        <h3 className="text-xl font-semibold text-[#f5f3ef] mb-2">
          {state.stage === 'analyzing' && 'Analyzing code...'}
          {state.stage === 'installing' && 'Installing packages...'}
          {state.stage === 'applying' && 'Applying changes...'}
        </h3>

        <p className="text-[#b8b0a8] text-sm mb-6">
          {state.stage === 'analyzing' && 'Parsing generated code and detecting dependencies...'}
          {state.stage === 'installing' && 'Installing required npm packages...'}
          {state.stage === 'applying' && 'Writing files to your sandbox environment...'}
        </p>

        {/* Package List during installation */}
        {state.stage === 'installing' && state.packages && state.packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {state.packages.map((pkg, index) => (
                <motion.span
                  key={pkg}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    state.installedPackages?.includes(pkg)
                      ? 'bg-[#8b7355]/20 text-[#8b7355] border border-[#8b7355]/30'
                      : 'bg-[#1a1a1a] text-[#6b6b6b] border border-[#333]'
                  }`}
                >
                  {pkg}
                  {state.installedPackages?.includes(pkg) && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-1.5"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.span>
              ))}
            </div>
            
            {state.installedPackages && state.installedPackages.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#8b7355] mt-3"
              >
                Installed {state.installedPackages.length} of {state.packages.length} packages
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Files count during applying */}
        {state.stage === 'applying' && state.filesGenerated && state.filesGenerated.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[#b8b0a8] mb-4"
          >
            Creating {state.filesGenerated.length} files...
          </motion.p>
        )}

        {/* Progress Bar */}
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#8b7355] to-[#a08060]"
            initial={{ width: 0 }}
            animate={{
              width: state.stage === 'analyzing' ? '33%' :
                     state.stage === 'installing' ? '66%' :
                     state.stage === 'applying' ? '90%' : '100%'
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </motion.div>
    </div>
  );
}
