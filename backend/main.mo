import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

actor {
    // Post type definition
    public type Post = {
        title: Text;
        body: Text;
        author: Text;
        timestamp: Int;
    };

    // Stable variable to store posts
    private stable var posts : [Post] = [];
    private let postsBuffer = Buffer.Buffer<Post>(0);

    // Initialize buffer with stable posts
    private func initBuffer() {
        for (post in posts.vals()) {
            postsBuffer.add(post);
        };
    };

    // Called after upgrade
    system func postupgrade() {
        initBuffer();
    };

    // Store current state before upgrade
    system func preupgrade() {
        posts := Buffer.toArray(postsBuffer);
    };

    // Add a new post
    public shared func createPost(title: Text, body: Text, author: Text) : async Post {
        let post : Post = {
            title = title;
            body = body;
            author = author;
            timestamp = Time.now();
        };
        postsBuffer.add(post);
        post
    };

    // Get all posts in reverse chronological order
    public query func getPosts() : async [Post] {
        let currentPosts = Buffer.toArray(postsBuffer);
        Array.tabulate<Post>(
            currentPosts.size(),
            func(i: Nat) : Post {
                currentPosts[currentPosts.size() - 1 - i]
            }
        )
    };
}
