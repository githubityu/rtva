//这个 AbiUtils 类包含了以下ABI定义，每个定义只包含实际用到的函数：
//
// 1. 1.
//    USDT_ABI - 包含 decimals 和 approve 函数
// 2. 2.
//    TOKEN_SWAP_ABI - 只包含 buyTokens 函数
// 3. 3.
//    MULTISIG_PLUGIN_ABI - 包含 isMember 、 approve 和 proposalCount 函数
// 4. 4.
//    DAO_ABI - 包含 hasPermission 函数
// 5. 5.
//    LOCK_TO_VETO_PLUGIN_ABI - 包含 canVeto 和 vetoPermit 函数
// 6. 6.
//    OPTIMISTIC_TOKEN_VOTING_PLUGIN_ABI - 包含 canVeto 和 veto 函数
// 7. 7.
//    DAO_FACTORY_ABI - 包含 createDao 函数
// 8. 8.
//    PLUGIN_REPO_FACTORY_ABI - 包含 createPluginRepo 函数
// 9. 9.
//    PLUGIN_REPO_REGISTRY_ABI - 包含 registerPluginRepo 函数
// 10. 10.
//     PLUGIN_SETUP_PROCESSOR_ABI - 包含 prepareInstallation 函数

export default class AbiUtils {
    static readonly USDT_ABI = [
        {
            inputs: [],
            name: 'decimals',
            outputs: [{ name: '', type: 'uint8' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly TOKEN_SWAP_ABI = [
        {
            inputs: [{ name: '_usdtAmount', type: 'uint256' }],
            name: 'buyTokens',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly MULTISIG_PLUGIN_ABI = [
        {
            // 从验证过的完整 ABI 中精确提取
            "inputs": [
                { "internalType": "address", "name": "_account", "type": "address" }
            ],
            "name": "isMember",
            "outputs": [
                { "internalType": "bool", "name": "", "type": "bool" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            inputs: [
                { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
                { internalType: 'bool', name: '_tryExecution', type: 'bool' },
            ],
            name: 'approve',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'proposalCount',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
    ] as const;

    static readonly DAO_ABI = [
        {
            inputs: [
                { internalType: 'address', name: 'where', type: 'address' },
                { internalType: 'address', name: 'who', type: 'address' },
                { internalType: 'bytes32', name: 'permissionId', type: 'bytes32' },
                { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            name: 'hasPermission',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
    ] as const;

    static readonly LOCK_TO_VETO_PLUGIN_ABI = [
        {
            inputs: [
                { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
                { internalType: 'address', name: '_voter', type: 'address' },
            ],
            name: 'canVeto',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
                { internalType: 'uint256', name: '_amountToLock', type: 'uint256' },
                { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                { internalType: 'uint8', name: 'v', type: 'uint8' },
                { internalType: 'bytes32', name: 'r', type: 'bytes32' },
                { internalType: 'bytes32', name: 's', type: 'bytes32' },
            ],
            name: 'vetoPermit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly OPTIMISTIC_TOKEN_VOTING_PLUGIN_ABI = [
        {
            inputs: [
                { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
                { internalType: 'address', name: '_voter', type: 'address' },
            ],
            name: 'canVeto',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
            ],
            name: 'veto',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly DAO_FACTORY_ABI = [
        {
            inputs: [
                {
                    components: [
                        { internalType: 'address', name: 'trustedForwarder', type: 'address' },
                        { internalType: 'string', name: 'daoURI', type: 'string' },
                        { internalType: 'string', name: 'subdomain', type: 'string' },
                        { internalType: 'bytes', name: 'metadata', type: 'bytes' },
                    ],
                    internalType: 'struct DAOFactory.DAOSettings',
                    name: '_daoSettings',
                    type: 'tuple',
                },
                {
                    components: [
                        {
                            components: [
                                {
                                    components: [
                                        { internalType: 'uint8', name: 'release', type: 'uint8' },
                                        { internalType: 'uint16', name: 'build', type: 'uint16' },
                                    ],
                                    internalType: 'struct PluginRepo.Tag',
                                    name: 'versionTag',
                                    type: 'tuple',
                                },
                                { internalType: 'contract PluginRepo', name: 'pluginSetupRepo', type: 'address' },
                            ],
                            internalType: 'struct PluginSetupRef',
                            name: 'pluginSetupRef',
                            type: 'tuple',
                        },
                        { internalType: 'bytes', name: 'data', type: 'bytes' },
                    ],
                    internalType: 'struct DAOFactory.PluginSettings[]',
                    name: '_pluginSettings',
                    type: 'tuple[]',
                },
            ],
            name: 'createDao',
            outputs: [{ internalType: 'contract DAO', name: 'createdDao', type: 'address' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly PLUGIN_REPO_FACTORY_ABI = [
        {
            inputs: [
                { internalType: 'string', name: '_subdomain', type: 'string' },
                { internalType: 'address', name: '_initialOwner', type: 'address' },
            ],
            name: 'createPluginRepo',
            outputs: [{ internalType: 'contract PluginRepo', name: '', type: 'address' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly PLUGIN_REPO_REGISTRY_ABI = [
        {
            inputs: [
                { internalType: 'string', name: '_subdomain', type: 'string' },
                { internalType: 'address', name: '_pluginRepo', type: 'address' },
            ],
            name: 'registerPluginRepo',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    static readonly PLUGIN_SETUP_PROCESSOR_ABI = [
        {
            inputs: [
                { internalType: 'address', name: '_dao', type: 'address' },
                {
                    components: [
                        {
                            components: [
                                { internalType: 'uint8', name: 'release', type: 'uint8' },
                                { internalType: 'uint16', name: 'build', type: 'uint16' },
                            ],
                            internalType: 'struct PluginRepo.Tag',
                            name: 'versionTag',
                            type: 'tuple',
                        },
                        { internalType: 'contract PluginRepo', name: 'pluginSetupRepo', type: 'address' },
                    ],
                    internalType: 'struct PluginSetupRef',
                    name: '_pluginSetupRef',
                    type: 'tuple',
                },
                { internalType: 'bytes', name: '_data', type: 'bytes' },
            ],
            name: 'prepareInstallation',
            outputs: [
                { internalType: 'address', name: 'plugin', type: 'address' },
                {
                    components: [
                        { internalType: 'address[]', name: 'helpers', type: 'address[]' },
                        { internalType: 'bytes', name: 'permissions', type: 'bytes' },
                    ],
                    internalType: 'struct IPluginSetup.PreparedSetupData',
                    name: 'preparedSetupData',
                    type: 'tuple',
                },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;
}
