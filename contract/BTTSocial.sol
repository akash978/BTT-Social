// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BTTSocial {
    struct User {
        string name;
        string avatar;
        string bio;
    }

    struct Post {
        string text;
        string content;
        address author;
        uint created_timestamp;
    }

    struct Comment {
        string text;
        address author;
        uint created_timestamp;
    }

    event NewPost(uint post_nr);
    event NewComment(uint post_nr, uint comment_nr);

    address[] private users;
    mapping(address => User) private user_info;
    mapping(address => address[]) private user_followers;
    mapping(address => uint) private user_donations;

    uint public posts_count = 0;
    mapping(uint => Post) private post_info;
    mapping(address => uint) public posts_count_of_user;
    mapping(address => mapping(uint => uint)) private post_of_user_by_index;
    mapping(uint => uint) private post_donations;


    uint public comments_count = 0;
    mapping(uint => Comment) private comment_info;
    mapping(uint => uint[]) private comments_of_post;

    uint public likes_count = 0;
    mapping(uint => uint) public likes_count_of_post;
    mapping(uint => mapping(address => bool)) private like_status;

    constructor() {}

    function get_users() public view returns (address[] memory) {
        return users;
    }

    function get_user_info(address user_address) public view returns (User memory) {
        return user_info[user_address];
    }

    function get_user_followers(address user_address) public view returns (address[] memory) {
        return user_followers[user_address];
    }

    function get_user_total_donations(address user_address) public view returns (uint) {
        return user_donations[user_address];
    }

    function is_user_followed_by(address user_address, address follower_address) public view returns (bool) {
        for (uint i = 0; i < user_followers[user_address].length; i++) {
            if (user_followers[user_address][i] == follower_address) {
                return true;
            }
        }
        return false;
    }
    
    function user_interacted(address user_address) public view returns (bool) {
        for (uint i = 0; i < users.length; i++) {
            if(users[i] == user_address) {
                return true;
            }
        }
        return false;
    }

    function get_post_info(uint post_nr) public view returns (Post memory) {
        require(post_nr <= posts_count, "Inexistent post !");
        return post_info[post_nr];
    }

    function get_post_of_user_by_index(address user_address, uint post_index) public view returns (uint) {
        require(post_index < posts_count_of_user[user_address], "Inexistent post !");
        return post_of_user_by_index[user_address][post_index];
    }

    function get_comments_of_post(uint post_nr) public view returns (uint[] memory) {
        require(post_nr <= posts_count, "Inexistent post !");
        return comments_of_post[post_nr];
    }

    function get_comment_info(uint comment_nr) public view returns (Comment memory) {
        require(comment_nr <= comments_count, "Inexistent comment !");
        return comment_info[comment_nr];
    }

    function get_post_donations(uint post_nr) public view returns (uint) {
        require(post_nr <= posts_count, "Inexistent post !");
        return post_donations[post_nr];
    }
    
    function is_post_liked_by(uint post_nr, address user_address) public view returns (bool) {
        require(post_nr <= posts_count, "Inexistent post !");
        return like_status[post_nr][user_address];
    }

    function edit_profile(string memory name, string memory avatar, string memory bio) public add_user returns (User memory){
        user_info[msg.sender].name = name;
        user_info[msg.sender].avatar = avatar;
        user_info[msg.sender].bio = bio;
        return user_info[msg.sender];
    }

    function create_post(string memory post_text, string memory post_content) public add_user returns (Post memory){
        posts_count += 1;
        post_info[posts_count] = Post(post_text, post_content, msg.sender, block.timestamp);
        post_of_user_by_index[msg.sender][posts_count_of_user[msg.sender]] = posts_count;
        posts_count_of_user[msg.sender] += 1;

        emit NewPost(posts_count);
        return post_info[posts_count];
    }

    function add_comment(uint post_nr, string memory comment_text) public add_user returns (Comment memory){
        require(post_nr <= posts_count, "Inexistent post !");
        comments_count += 1;
        comment_info[comments_count] = Comment(comment_text, msg.sender, block.timestamp);
        comments_of_post[post_nr].push(comments_count);

        emit NewComment(post_nr, comments_count);
        return comment_info[comments_count];
    }

    function add_or_remove_like(uint post_nr) public add_user returns (bool){
        require(post_nr <= posts_count, "Inexistent post !");
        if(is_post_liked_by(post_nr, msg.sender) == true){
            likes_count -= 1;
            likes_count_of_post[post_nr] -= 1;
            like_status[post_nr][msg.sender] = false;
            return false;
        } else {
            likes_count += 1;
            likes_count_of_post[post_nr] += 1;
            like_status[post_nr][msg.sender] = true;
            return true;
        }
    }

    function send_tip(uint post_nr) public add_user payable returns (uint){
        require(post_nr <= posts_count, "Inexistent post !");
        address payable post_author = payable(post_info[post_nr].author);
        post_author.transfer(msg.value);
        user_donations[post_info[post_nr].author] += msg.value;
        post_donations[post_nr] += msg.value;
        return post_donations[post_nr];
    }

    function follow_or_unfollow(address user_address) public add_user returns (bool){
        require(user_address != msg.sender, "You cannot follow yourself !");
        if(is_user_followed_by(user_address, msg.sender) == true){
            for (uint i = 0; i < user_followers[user_address].length; i++) {
                if (user_followers[user_address][i] == msg.sender) {
                    user_followers[user_address][i] = user_followers[user_address][user_followers[user_address].length - 1];
                    user_followers[user_address].pop();
                }
            }
            return false;
        } else {
            user_followers[user_address].push(msg.sender);
            return true;
        }
    }

    modifier add_user() {
        if(!user_interacted(msg.sender)) {
            users.push(msg.sender);
        }
        _;
    }
} 