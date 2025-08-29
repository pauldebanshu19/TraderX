'use client';

import { useState } from 'react';
import type { HumanMessage } from '@langchain/core/messages';
import type { IterableReadableStream } from '@langchain/core/utils/stream';

export interface AgentType {
    stream: (params: {
        messages: HumanMessage[];
    }, config: AgentConfig) => Promise<IterableReadableStream<{
        agent?: { messages: { kwargs: { content: string } }[] };
        tools?: { messages: { kwargs: { content: string, error?: string } }[] };
    }>>;
}

export interface AgentConfig {
    configurable: {
        thread_id: string;
    };
}

interface Props {
    onInitialize: (agent: AgentType, config: AgentConfig) => void;
    privateKey?: `0x${string}`;
}

export default function AgentInitializer({ onInitialize, privateKey }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInitialize = async () => {
        if (!privateKey) {
            setError('Wallet must be connected before initializing agent');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/agent', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ privateKey })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to initialize agent');
            }
            
            onInitialize(data.agent, data.config);
        } catch (err) {
            console.error('Agent initialization error:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize agent');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                Initialize AI Agent
            </h2>

            {!privateKey && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
                    <p className="text-sm">
                        ⚠️ Please connect your wallet first before initializing the agent.
                    </p>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                    <p className="text-sm font-medium">Error: {error}</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleInitialize}
                disabled={isLoading || !privateKey}
                className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
                    isLoading || !privateKey
                        ? 'bg-purple-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
                {isLoading ? 'Initializing...' : 'Initialize Agent'}
            </button>
            
            {privateKey && (
                <p className="mt-2 text-xs text-gray-600 text-center">
                    Agent will be initialized with your connected wallet
                </p>
            )}
        </div>
    );
} 