export default class LocalUtils {
    static readonly USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;
    static readonly TOKEN_SWAP_CONTRACT_ADDRESS = '0xf5B6e4Daad320BD8b45d7Ad0Fb9Ab484BfAf610a' as const;

    //充值的
    static readonly DEPOSIT_CONTRACT_ADDRESS = '0x59b670e9fA9D0A427751Af201D676719a970857b' as const;


    // 我的代币合约地址
    static readonly MY_TOKEN_ADDRESS = '0x5d9beb2EB8e653b3b55f0e363feC4fC1e07594BF' as const;
    static readonly ZODIAC_NFT_ADDRESS = '0xb5851064827cB1F915FFF21F89F76b2f282258c5' as const;
    static readonly ZODIAC_EXCHANGER_ADDRESS = '0xB7995baE1EF19D2F55a3eCD16A048753A65bf56f' as const;


    static readonly GOVERNOR_ADDRESS = '0x...'; // 你的 Governor 合约地址
    static readonly FACTORY_ADDRESS = '0x...';  // 你的 ContractFactory 合约地址
    static readonly TOKEN_NAME = 'LBB';  // 你的 ContractFactory 合约地址

// 最小化的 ABI，只包含我们需要的函数
    static readonly GOVERNOR_ABI = [
        {
            "type": "function",
            "name": "propose",
            "inputs": [
                {"name": "targets", "type": "address[]", "internalType": "address[]"},
                {"name": "values", "type": "uint256[]", "internalType": "uint256[]"},
                {"name": "calldatas", "type": "bytes[]", "internalType": "bytes[]"},
                {"name": "description", "type": "string", "internalType": "string"}
            ],
            "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
            "stateMutability": "nonpayable"
        }
    ] as const;

    static readonly FACTORY_ABI = [
        {
            "type": "function",
            "name": "deployContract",
            "inputs": [{"name": "bytecode", "type": "bytes", "internalType": "bytes"}],
            "outputs": [{"name": "deployedAddress", "type": "address", "internalType": "address"}],
            "stateMutability": "nonpayable"
        }
    ] as const;


    static readonly USDT_ABI = [
        {
            inputs: [],
            name: 'decimals',
            outputs: [{name: '', type: 'uint8'}],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {name: 'spender', type: 'address'},
                {name: 'value', type: 'uint256'},
            ],
            name: 'approve',
            outputs: [{name: '', type: 'bool'}],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            "type": "function",
            "name": "transfer",
            "inputs": [
                {"name": "to", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable"
        }
    ] as const;

    static readonly TOKEN_SWAP_ABI = [
        {
            inputs: [{name: '_usdtAmount', type: 'uint256'}],
            name: 'buyTokens',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly MY_TOKEN_ABI = [
        // --- 用于 Permit ---
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [{"name": "", "type": "string"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "nonces",
            "inputs": [{"name": "owner", "type": "address"}],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        // 'permit' 函数本身不是由前端直接调用的，
        // 而是由 DepositContract 调用的，所以严格来说前端不需要它的 ABI。
        // 但为了完整性，可以包含它。
        {
            "type": "function",
            "name": "permit",
            "inputs": [
                {"name": "owner", "type": "address"},
                {"name": "spender", "type": "address"},
                {"name": "value", "type": "uint256"},
                {"name": "deadline", "type": "uint256"},
                {"name": "v", "type": "uint8"},
                {"name": "r", "type": "bytes32"},
                {"name": "s", "type": "bytes32"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        }
    ] as const;

    static readonly DEPOSIT_CONTRACT_ABI = [
        // --- 核心存款函数 ---
        {
            "type": "function",
            "name": "depositWithPermit",
            "inputs": [
                {"name": "amount", "type": "uint256"},
                {"name": "deadline", "type": "uint256"},
                {"name": "v", "type": "uint8"},
                {"name": "r", "type": "bytes32"},
                {"name": "s", "type": "bytes32"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        // --- 用于查询存款信息 ---
        {
            "type": "function",
            "name": "deposits",
            "inputs": [{"name": "", "type": "address"}],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        // --- 事件（可选，但对于监听很有用）---
        {
            "type": "event",
            "name": "Deposited",
            "inputs": [
                {"name": "user", "type": "address", "indexed": true},
                {"name": "amount", "type": "uint256", "indexed": false}
            ],
            "anonymous": false
        }
    ] as const;

    static readonly ZODIAC_NFT_ABI = [
        // --- 核心存款函数 ---
        {
            "type": "function",
            "name": "depositWithPermit",
            "inputs": [
                {"name": "amount", "type": "uint256"},
                {"name": "deadline", "type": "uint256"},
                {"name": "v", "type": "uint8"},
                {"name": "r", "type": "bytes32"},
                {"name": "s", "type": "bytes32"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "balanceOfBatch",
            "inputs": [
                {"name": "accounts", "type": "address[]"},
                {"name": "ids", "type": "uint256[]"}
            ],
            "outputs": [{"name": "", "type": "uint256[]"}],
            "stateMutability": "view"
        },
        // --- 用于查询存款信息 ---
        {
            "type": "function",
            "name": "deposits",
            "inputs": [{"name": "", "type": "address"}],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isApprovedForAll",
            "inputs": [
                {"name": "account", "type": "address"},
                {"name": "operator", "type": "address"}
            ],
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "view"
        },

        // --- Core Write Functions ---
        // +++ 新增：setApprovalForAll，兑换流程的第一步 +++
        {
            "type": "function",
            "name": "setApprovalForAll",
            "inputs": [
                {"name": "operator", "type": "address"},
                {"name": "approved", "type": "bool"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {"name": "from", "type": "address"},
                {"name": "to", "type": "address"},
                {"name": "id", "type": "uint256"},
                {"name": "value", "type": "uint256"},
                {"name": "data", "type": "bytes"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        // --- 事件（可选，但对于监听很有用）---
        {
            "type": "event",
            "name": "Deposited",
            "inputs": [
                {"name": "user", "type": "address", "indexed": true},
                {"name": "amount", "type": "uint256", "indexed": false}
            ],
            "anonymous": false
        }
    ] as const;

    static readonly ZODIAC_EXCHANGER_ABI = [
        // --- Constructor ---
        // (构造函数不包含在运行时 ABI 中，但为了完整性，有时会列出)
        // { "type": "constructor", "inputs": [...] }

        // --- Core User Functions ---
        {
            "type": "function",
            "name": "drawZodiac",
            "inputs": [],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "drawSpecificZodiac",
            "inputs": [
                {"name": "_user", "type": "address"},
                {"name": "_zodiacId", "type": "uint256"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "drawSpecificZodiacBatch",
            "inputs": [
                {"name": "_users", "type": "address[]"},
                {"name": "_zodiacIds", "type": "uint256[]"}
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "exchangeForMyToken",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },

        // --- Admin Functions (from Ownable and custom) ---
        {
            "type": "function",
            "name": "setDrawPrice",
            "inputs": [{"name": "_newPrice", "type": "uint256"}],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setMyTokenThreshold",
            "inputs": [{"name": "_newThreshold", "type": "uint256"}],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "withdrawFunds",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "withdrawMyToken",
            "inputs": [{"name": "_amount", "type": "uint256"}],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "renounceOwnership",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "transferOwnership",
            "inputs": [{"name": "newOwner", "type": "address"}],
            "outputs": [],
            "stateMutability": "nonpayable"
        },

        // --- View Functions (public state variable getters) ---
        {
            "type": "function",
            "name": "drawPrice",
            "inputs": [],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "myToken",
            "inputs": [],
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "myTokenThreshold",
            "inputs": [],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "NUM_ZODIACS",
            "inputs": [],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "zodiacNFT",
            "inputs": [],
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "view"
        },

        // --- Events ---
        {
            "type": "event",
            "name": "Draw",
            "inputs": [
                {"name": "user", "type": "address", "indexed": true},
                {"name": "zodiacId", "type": "uint256", "indexed": true}
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Exchange",
            "inputs": [
                {"name": "user", "type": "address", "indexed": true},
                {"name": "myTokenAmount", "type": "uint256", "indexed": false}
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "OwnershipTransferred",
            "inputs": [
                {"name": "previousOwner", "type": "address", "indexed": true},
                {"name": "newOwner", "type": "address", "indexed": true}
            ],
            "anonymous": false
        },

        // --- Custom Errors ---
        {"type": "error", "name": "IncorrectFee", "inputs": []},
        {"type": "error", "name": "IncompleteSet", "inputs": []},
        {
            "type": "error", "name": "InsufficientMyTokenBalance", "inputs": [
                {"name": "required", "type": "uint256"},
                {"name": "current", "type": "uint256"}
            ]
        },
        {"type": "error", "name": "NotApprovedForAll", "inputs": []},
        {"type": "error", "name": "NotEnoughMyTokenInContract", "inputs": []},
        {"type": "error", "name": "TransferFailed", "inputs": []},
        {
            "type": "error", "name": "OwnableInvalidOwner", "inputs": [
                {"name": "owner", "type": "address"}
            ]
        },
        {
            "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [
                {"name": "account", "type": "address"}
            ]
        }
    ] as const;

}
