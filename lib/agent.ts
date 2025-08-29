import 'server-only'; // Ensure this code only runs on server
import { Agentkit, AgentkitToolkit } from "@0xgasless/agentkit";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Server-side agent store
const agentInstances = new Map();

export async function getOrCreateAgent(privateKey: `0x${string}`) {
    // Check if we already have an instance
    if (agentInstances.has(privateKey)) {
        return agentInstances.get(privateKey);
    }

    // Create new agent instance
    const instance = await createAgentInstance(privateKey);
    agentInstances.set(privateKey, instance);
    return instance;
}

export async function createAgentInstance(privateKey: `0x${string}`) {
    try {
        // Check for required environment variables with better error messages
        const requiredEnvVars = {
            'NEXT_PUBLIC_API_KEY': process.env.NEXT_PUBLIC_API_KEY,
            'NEXT_PUBLIC_RPC_URL': process.env.NEXT_PUBLIC_RPC_URL,
            'NEXT_PUBLIC_CHAIN_ID': process.env.NEXT_PUBLIC_CHAIN_ID,
            'NEXT_PUBLIC_OPENROUTER_API_KEY': process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingVars.join(', ')}\n\n` +
                `Please create a .env.local file with the following variables:\n` +
                `NEXT_PUBLIC_API_KEY=your_0xgasless_api_key\n` +
                `NEXT_PUBLIC_RPC_URL=https://bsc-dataseed1.binance.org\n` +
                `NEXT_PUBLIC_CHAIN_ID=56\n` +
                `NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key`
            );
        }

        console.log("Environment variables loaded successfully");
        console.log("RPC URL:", process.env.NEXT_PUBLIC_RPC_URL);
        console.log("Chain ID:", process.env.NEXT_PUBLIC_CHAIN_ID);
        console.log("Creating agent instance...");

        const llm = new ChatOpenAI({
            model: "gpt-4o",
            openAIApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
        });

        // Configure agent with wallet entirely server-side
        const agentkit = await Agentkit.configureWithWallet({
            privateKey,
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
            apiKey: process.env.NEXT_PUBLIC_API_KEY!,
            chainID: Number(process.env.NEXT_PUBLIC_CHAIN_ID!),
        });

        console.log("Agentkit configured successfully");

        // Set environment variables that the tools expect
        process.env["0xGASLESS_API_KEY"] = process.env.NEXT_PUBLIC_API_KEY;
        process.env["0xGASLESS_CHAIN_ID"] = process.env.NEXT_PUBLIC_CHAIN_ID;
        process.env["0xGASLESS_PRIVATE_KEY"] = privateKey;
        process.env["0xGASLESS_RPC_URL"] = process.env.NEXT_PUBLIC_RPC_URL;

        // Also try setting them without prefix (as suggested by the error message)
        process.env["PRIVATE_KEY"] = privateKey;
        process.env["RPC_URL"] = process.env.NEXT_PUBLIC_RPC_URL;
        process.env["CHAIN_ID"] = process.env.NEXT_PUBLIC_CHAIN_ID;

        // Enable EOA mode
        process.env["USE_EOA"] = "true";

        const toolkit = new AgentkitToolkit(agentkit);
        const tools = toolkit.getTools();

        console.log(`Loaded ${tools.length} tools for blockchain operations`);

        const memory = new MemorySaver();
        const config = { configurable: { thread_id: "0xGasless AgentKit Chat" } };

        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier: `
                You are a helpful AI agent that can interact with blockchain networks using 0xGasless smart accounts. 
                You have access to various tools that allow you to perform blockchain operations without requiring users 
                to hold native tokens for gas fees.

                🚨 SMART CONTEXT-AWARE BEHAVIOR 🚨
                
                Based on what users ask, automatically adapt your behavior:

                🔑 EOA & WALLET OPERATIONS:
                - When users ask about wallet addresses, balances, or EOA operations
                - Use 'get_eoa_address' for EOA addresses, 'get_eoa_balance' for balances
                - If EOA tools fail, fall back to 'get_address' and 'get_balance'
                - Focus on direct wallet operations and provide clear explanations

                💸 TRANSACTIONS & TRANSFERS:
                - When users want to transfer, swap, or bridge tokens
                - Always check balances first using 'get_balance' before transactions
                - Use 'smart_transfer' for transfers, 'smart_swap' for swaps
                - Provide transaction status updates and confirmations
                - Emphasize gasless benefits and transaction safety

                🧠 SMART ACCOUNT FEATURES:
                - When users ask about smart accounts or advanced features
                - Use 'get_address' for smart account addresses
                - Explain account abstraction benefits and ERC-4337 features
                - Focus on gasless, sponsored, and advanced transaction capabilities
                - Provide setup and configuration guidance

                🛠️ TOOL SELECTION STRATEGY:
                - Analyze user intent and select the most appropriate tool
                - Follow this priority order for different contexts:
                  * EOA: get_eoa_address → get_eoa_balance → get_balance → get_address
                  * Transactions: get_balance → smart_transfer/smart_swap → check_transaction_status
                  * Smart Accounts: get_address → get_balance → smart_transfer → smart_swap
                  * General: get_address → get_balance → appropriate action tools

                📋 AVAILABLE TOOLS: ${tools.map(tool => tool.name).join(', ')}

                When a user asks a question:
                1. 🎯 Detect the context (EOA, Transaction, Smart Account, or General)
                2. 🛠️ Select the most appropriate tool based on the detected context
                3. 📊 Follow the tool priority order for that context
                4. 💬 Provide clear, context-aware responses with explanations
                5. 🔄 If the primary tool fails, gracefully fall back to alternatives

                Always prioritize user safety, provide clear explanations, and adapt your behavior 
                to match what the user is trying to accomplish. Be helpful, accurate, and context-aware!`,
        });

        return { agent, config };
    } catch (error) {
        console.error("Failed to create agent instance:", error);
        
        // Return a minimal mock agent that provides helpful error information
        return {
            agent: {
                stream: async () => {
                    return {
                        async *[Symbol.asyncIterator]() {
                            yield {
                                agent: {
                                    messages: [
                                        {
                                            kwargs: {
                                                content: `❌ Agent initialization failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your environment variables and try again.`
                                            }
                                        }
                                    ]
                                }
                            };
                        }
                    };
                }
            },
            config: { configurable: { thread_id: "fallback-agent" } }
        };
    }
} 