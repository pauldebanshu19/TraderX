'use client';

import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Wallet from './Wallet';
import AgentInitializer, { AgentType, AgentConfig } from './AgentIntialize';
import ChatInterface from './ChatInterface';
import ErrorBoundary from './ErrorBoundary';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

export default function Dashboard() {
    const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(null);
    const [privateKey, setPrivateKey] = useState<`0x${string}` | null>(null);
    const [agent, setAgent] = useState<AgentType | null>(null);
    const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleWalletConnect = useCallback((address: `0x${string}`, key: `0x${string}`) => {
        setWalletAddress(address);
        setPrivateKey(key);
    }, []);

    const handleAgentInitialize = useCallback((agentInstance: AgentType, config: AgentConfig) => {
        setAgent(agentInstance);
        setAgentConfig(config);
        
        // Add welcome message
        const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: `🤖 AI Agent initialized successfully!\n\nYour wallet: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}\n\nI can help you with:\n• Checking wallet balances\n• Transferring tokens\n• Swapping tokens\n• Smart account operations\n• And much more!\n\nWhat would you like to do?`,
            isUser: false,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, [walletAddress]);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!agent || !agentConfig) {
            console.error('Agent not initialized');
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: message,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Send message to agent via API
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-action': 'chat'
                },
                body: JSON.stringify({
                    messages: [{ content: message }],
                    privateKey
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            let agentResponse = '';
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.agent?.messages?.[0]?.kwargs?.content) {
                            agentResponse += data.agent.messages[0].kwargs.content;
                        } else if (data.tools?.messages?.[0]?.kwargs?.content) {
                            agentResponse += data.tools.messages[0].kwargs.content;
                        } else if (data.error) {
                            throw new Error(data.error);
                        }
                    } catch {
                        console.warn('Failed to parse chunk:', line);
                    }
                }
            }

            // Add agent response
            if (agentResponse.trim()) {
                const agentMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: agentResponse,
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, agentMessage]);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to get response from agent'}`,
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [agent, agentConfig, privateKey]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <Toaster position="top-right" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            TraderX AI Dashboard
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Connect your wallet and start trading with AI-powered insights
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Wallet & Agent Setup */}
                        <div className="space-y-6">
                            <ErrorBoundary>
                                {/* Wallet Connection */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        🔗 Wallet Connection
                                    </h2>
                                    {!walletAddress ? (
                                        <Wallet onConnect={handleWalletConnect} />
                                    ) : (
                                        <div className="text-center">
                                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                                                <p className="text-green-300 font-medium">
                                                    ✅ Wallet Connected
                                                </p>
                                                <p className="text-green-200 text-sm mt-1">
                                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setWalletAddress(null);
                                                    setPrivateKey(null);
                                                    setAgent(null);
                                                    setAgentConfig(null);
                                                    setMessages([]);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Disconnect Wallet
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Agent Initialization */}
                                {walletAddress && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <h2 className="text-xl font-semibold text-white mb-4">
                                            🤖 AI Agent
                                        </h2>
                                        {!agent ? (
                                            <AgentInitializer 
                                                onInitialize={handleAgentInitialize}
                                                privateKey={privateKey || undefined}
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                                                    <p className="text-blue-300 font-medium">
                                                        ✅ Agent Active
                                                    </p>
                                                    <p className="text-blue-200 text-sm mt-1">
                                                        Ready to help with trading
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ErrorBoundary>
                        </div>

                        {/* Right Column - Chat Interface */}
                        <div className="lg:col-span-2">
                            <ErrorBoundary>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-[600px]">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        💬 AI Trading Assistant
                                    </h2>
                                    {agent ? (
                                        <ChatInterface
                                            onSendMessage={handleSendMessage}
                                            messages={messages}
                                            isLoading={isLoading}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center text-gray-400">
                                                <div className="text-6xl mb-4">🤖</div>
                                                <p className="text-lg mb-2">Connect your wallet and initialize the AI agent</p>
                                                <p className="text-sm">Then you can start chatting about trading!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
