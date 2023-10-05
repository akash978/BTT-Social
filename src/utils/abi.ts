export const CONTRACT_ABI = [{
    "inputs": [{
        "internalType": "uint256",
        "name": "post_nr",
        "type": "uint256"
    }, {"internalType": "string", "name": "comment_text", "type": "string"}],
    "name": "add_comment",
    "outputs": [{
        "components": [{
            "internalType": "string",
            "name": "text",
            "type": "string"
        }, {"internalType": "address", "name": "author", "type": "address"}, {
            "internalType": "uint256",
            "name": "created_timestamp",
            "type": "uint256"
        }], "internalType": "struct BTTSocial.Comment", "name": "", "type": "tuple"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "add_or_remove_like",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "string", "name": "post_text", "type": "string"}, {
        "internalType": "string",
        "name": "post_content",
        "type": "string"
    }],
    "name": "create_post",
    "outputs": [{
        "components": [{"internalType": "string", "name": "text", "type": "string"}, {
            "internalType": "string",
            "name": "content",
            "type": "string"
        }, {"internalType": "address", "name": "author", "type": "address"}, {
            "internalType": "uint256",
            "name": "created_timestamp",
            "type": "uint256"
        }], "internalType": "struct BTTSocial.Post", "name": "", "type": "tuple"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {
        "internalType": "string",
        "name": "avatar",
        "type": "string"
    }, {"internalType": "string", "name": "bio", "type": "string"}],
    "name": "edit_profile",
    "outputs": [{
        "components": [{"internalType": "string", "name": "name", "type": "string"}, {
            "internalType": "string",
            "name": "avatar",
            "type": "string"
        }, {"internalType": "string", "name": "bio", "type": "string"}],
        "internalType": "struct BTTSocial.User",
        "name": "",
        "type": "tuple"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}],
    "name": "follow_or_unfollow",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
}, {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "post_nr", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "comment_nr",
        "type": "uint256"
    }],
    "name": "NewComment",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "NewPost",
    "type": "event"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "send_tip",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [],
    "name": "comments_count",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "comment_nr", "type": "uint256"}],
    "name": "get_comment_info",
    "outputs": [{
        "components": [{
            "internalType": "string",
            "name": "text",
            "type": "string"
        }, {"internalType": "address", "name": "author", "type": "address"}, {
            "internalType": "uint256",
            "name": "created_timestamp",
            "type": "uint256"
        }], "internalType": "struct BTTSocial.Comment", "name": "", "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "get_comments_of_post",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "get_post_donations",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}],
    "name": "get_post_info",
    "outputs": [{
        "components": [{"internalType": "string", "name": "text", "type": "string"}, {
            "internalType": "string",
            "name": "content",
            "type": "string"
        }, {"internalType": "address", "name": "author", "type": "address"}, {
            "internalType": "uint256",
            "name": "created_timestamp",
            "type": "uint256"
        }], "internalType": "struct BTTSocial.Post", "name": "", "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}, {
        "internalType": "uint256",
        "name": "post_index",
        "type": "uint256"
    }],
    "name": "get_post_of_user_by_index",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}],
    "name": "get_user_followers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}],
    "name": "get_user_info",
    "outputs": [{
        "components": [{"internalType": "string", "name": "name", "type": "string"}, {
            "internalType": "string",
            "name": "avatar",
            "type": "string"
        }, {"internalType": "string", "name": "bio", "type": "string"}],
        "internalType": "struct BTTSocial.User",
        "name": "",
        "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}],
    "name": "get_user_total_donations",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "get_users",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "post_nr", "type": "uint256"}, {
        "internalType": "address",
        "name": "user_address",
        "type": "address"
    }],
    "name": "is_post_liked_by",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}, {
        "internalType": "address",
        "name": "follower_address",
        "type": "address"
    }],
    "name": "is_user_followed_by",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "likes_count",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "likes_count_of_post",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "posts_count",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "posts_count_of_user",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "user_address", "type": "address"}],
    "name": "user_interacted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}]