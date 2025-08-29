'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Smart context detection system
const detectUserIntent = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    // EOA-related keywords
    const eoaKeywords = [
        'eoa', 'externally owned account', 'wallet address', 'my address', 
        'account address', 'private key', 'seed phrase', 'mnemonic',
        'balance', 'check balance', 'how much', 'tokens', 'coins'
    ];
    
    // Transaction-related keywords
    const transactionKeywords = [
        'transfer', 'send', 'receive', 'swap', 'bridge', 'exchange',
        'buy', 'sell', 'trade', 'transaction', 'gas', 'fee', 'confirm',
        'pending', 'hash', 'tx', 'blockchain', 'onchain'
    ];
    
    // Smart Account-related keywords
    const smartAccountKeywords = [
        'smart account', 'account abstraction', 'erc-4337', 'bundler',
        'paymaster', 'gasless', 'sponsored', 'counterfactual', 'factory',
        'deploy', 'initialize', 'setup', 'configure'
    ];
    
    // Count matches for each category
    let eoaScore = 0;
    let transactionScore = 0;
    let smartAccountScore = 0;
    
    eoaKeywords.forEach(keyword => {
        if (message.includes(keyword)) eoaScore++;
    });
    
    transactionKeywords.forEach(keyword => {
        if (message.includes(keyword)) transactionScore++;
    });
    
    smartAccountKeywords.forEach(keyword => {
        if (message.includes(keyword)) smartAccountScore++;
    });
    
    // Determine the primary intent
    if (eoaScore > transactionScore && eoaScore > smartAccountScore) {
        return 'EOA';
    } else if (transactionScore > eoaScore && transactionScore > smartAccountScore) {
        return 'TRANSACTION';
    } else if (smartAccountScore > eoaScore && smartAccountScore > transactionScore) {
        return 'SMART_ACCOUNT';
    } else {
        return 'GENERAL'; // Default fallback
    }
};

// Get context-specific guidance
const getContextGuidance = (intent: string) => {
    switch (intent) {
        case 'EOA':
            return {
                title: '🔑 EOA Mode Detected',
                description: 'You\'re asking about wallet addresses, balances, or EOA operations',
                guidance: 'The AI will use EOA-specific tools to help you with wallet operations',
                color: 'bg-blue-100 border-blue-300 text-blue-800'
            };
            
        case 'TRANSACTION':
            return {
                title: '💸 Transaction Mode Detected',
                description: 'You want to transfer, swap, or bridge tokens',
                guidance: 'The AI will use transaction tools and check balances before operations',
                color: 'bg-green-100 border-green-300 text-green-800'
            };
            
        case 'SMART_ACCOUNT':
            return {
                title: '🧠 Smart Account Mode Detected',
                description: 'You\'re asking about smart accounts or advanced features',
                guidance: 'The AI will explain account abstraction and use smart account tools',
                color: 'bg-purple-100 border-purple-300 text-purple-800'
            };
            
        default:
            return {
                title: '🤖 General Mode',
                description: 'General blockchain operations and information',
                guidance: 'The AI will use standard tools to help you',
                color: 'bg-gray-100 border-gray-300 text-gray-800'
            };
    }
};

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatInterfaceProps {
    onSendMessage: (message: string) => void;
    messages: Message[];
    isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, messages, isLoading }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [detectedContext, setDetectedContext] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = () => {
        if (inputMessage.trim() && !isLoading) {
            // Detect context before sending
            const context = detectUserIntent(inputMessage);
            setDetectedContext(context);
            
            // Send the message
            onSendMessage(inputMessage);
            setInputMessage('');
            
            // Clear context after a delay
            setTimeout(() => setDetectedContext(null), 5000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const contextInfo = detectedContext ? getContextGuidance(detectedContext) : null;

    return (
        <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-600/80 w-full">
            {/* Context Detection Banner */}
            {contextInfo && (
                <div className={`p-4 border-l-4 ${contextInfo.color} transition-all duration-500 ease-in-out`}>
                    <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold">{contextInfo.title}</div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{contextInfo.description}</p>
                            <p className="text-xs opacity-75">{contextInfo.guidance}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-white/50 rounded-full font-medium">
                                🎯 {detectedContext}
                            </span>
                            <button 
                                onClick={() => setDetectedContext(null)}
                                className="text-xs opacity-50 hover:opacity-100 transition-opacity hover:scale-110 transform"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/30">
                {/* Debug info */}
                <div className="text-xs text-gray-300 p-2 bg-gray-800/50 rounded border border-gray-600">
                    <div>Messages count: {messages.length}</div>
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>Last message: {messages[messages.length - 1]?.content?.substring(0, 50) || 'None'}...</div>
                </div>
                
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
                                message.isUser
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                    : 'bg-gray-800/50 text-gray-100 border border-gray-600'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                {message.timestamp.toLocaleTimeString()} (ID: {message.id})
                            </p>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-sm font-medium">AI is analyzing your request...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-600 p-6 bg-gray-800/50 backdrop-blur-sm rounded-b-2xl">
                <div className="flex space-x-3">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            detectedContext 
                                ? `Ask about ${detectedContext.toLowerCase()} operations...` 
                                : "Ask me about your wallet, transactions, or smart accounts..."
                        }
                        className="flex-1 p-4 border border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm bg-gray-700 text-gray-100 placeholder-gray-400"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
                
                {/* Context Detection Hint */}
                <div className="mt-3 text-xs text-gray-400 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-blue-400">💡</span>
                        <span>The AI automatically detects what you&apos;re asking about and adapts its behavior accordingly</span>
                        {detectedContext && (
                            <span className="ml-2 px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full font-medium text-xs border border-blue-600">
                                {detectedContext}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface; 