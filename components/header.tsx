'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

interface WalletInfo {
  address: string
  balance: string
  chainId: string
}

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
  }

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            await handleWalletConnection(accounts[0])
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error)
        }
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled() && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          handleWalletConnection(accounts[0])
        } else {
          handleDisconnect()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (isMetaMaskInstalled() && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  const handleWalletConnection = async (account: string) => {
    if (!window.ethereum) return
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      })

      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })

      setWalletInfo({
        address: account,
        balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
        chainId: chainId
      })
      setIsConnected(true)
      toast.success('MetaMask connected successfully!')
      // Stay on current page; show connected account in header
    } catch (error) {
      console.error('Error getting wallet info:', error)
      toast.error('Failed to get wallet information')
    }
  }

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask first.')
      return
    }

    if (!window.ethereum) {
      toast.error('MetaMask is not available')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        await handleWalletConnection(accounts[0])
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          toast.error('Connection rejected by user')
        } else {
          toast.error('Failed to connect to MetaMask')
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletInfo(null)
    toast.success('Wallet disconnected')
  }


  return (
    <>
      <header
        className="sticky top-0 z-50 w-full px-4 md:px-6 relative"
        style={{
          background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
        }}
      >
        {/* Liquid background glow with animation */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 h-full w-1/2 animate-pulse-slow"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(155,135,245,0.25) 0%, rgba(13,10,25,0) 70%)",
            }}
          />
          <div
            className="absolute top-0 left-0 h-full w-1/2 animate-pulse-slower"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(135,245,212,0.2) 0%, rgba(13,10,25,0) 70%)",
            }}
          />
        </div>

        {/* Glassy navbar container */}
        <div
          className="mx-auto w-full max-w-6xl rounded-[28px] 
                     border border-white/10 
                     bg-white/10 backdrop-blur-xl 
                     shadow-[0_8px_30px_rgba(0,0,0,0.20)] 
                     animate shadow-purple-500/30"
        >
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-black shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]">
                  <Image
                    src="/assets/logo.png"
                    alt="TraderX logo"
                    width={36}
                    height={36}
                    className="rounded-full bg-white p-1 shadow-md "
                    priority
                  />
                </div>
                <span className="hidden text-base font-semibold tracking-wide text-white sm:inline">TraderX</span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="hidden items-center gap-8 text-sm md:flex">
              <Link href="/" className="hidden text-base font-semibold tracking-wide text-white sm:inline">Home</Link>
              <Link href="#about" className="hidden text-base font-semibold tracking-wide text-white sm:inline">About</Link>
              <Link href="#contact" className="hidden text-base font-semibold tracking-wide text-white sm:inline">Contact</Link>
            </nav>

            {/* Wallet button */}
            <div className="flex items-center gap-2">
              {!isConnected ? (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="relative rounded-full bg-black px-5 text-white 
                   shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12)] 
                   hover:bg-black/90 border border-white/10 
                   transition-all duration-300 ease-in-out
                   hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30
                   animate-pulse"
                >
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Wallet Info */}
                  <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm">
                      {walletInfo?.address.slice(0, 6)}...{walletInfo?.address.slice(-4)}
                    </span>
                    <span className="text-gray-300 text-xs">
                      {walletInfo?.balance} ETH
                    </span>
                  </div>
                  
                  {/* Disconnect Button */}
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="relative rounded-full px-3 text-white border-red-500/50
                     hover:bg-red-500/20 transition-all duration-300 ease-in-out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Dashboard UI removed from header */}
    </>
  )
}
