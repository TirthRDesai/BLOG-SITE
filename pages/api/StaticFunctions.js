import { DecryptData, EncryptData } from "../EncryptingFunctions"

export class StaticFunctions {

    constructor(Username) {
        this.Username = Username
    }

    async GetData() {
        if (this.Username != undefined && this.Username != "") {
            const response = await fetch("/api/GetUserData/" + this.Username, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            return EncryptData(JSON.stringify(data))
        } else {
            return EncryptData(JSON.stringify({ ok: false, message: "Empty Username" }))
        }
    }

    async UpdateData(data) {
        const response = await fetch("/api/UpdateData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: data, Username: this.Username })
        })
        const res = await response.json()
        return EncryptData(JSON.stringify(res))
    }

    // FRIENDUSERNAME : STRING, FOLLOWERS (FRIEND'S FOLLOWERS) : ARRAY ([]), FOLLOWING (USER'S FOLLOWINGS) : ARRAY ([])

    async FollowUser(FriendUsername, Followers, Following) {

        Followers.push(this.Username)
        Followers = Array.from(new Set(Followers))
        Following.push(FriendUsername)
        Following = Array.from(new Set(Following))

        const toSendData = [{
            Username: this.Username,
            FriendUsername: FriendUsername,
            newFollowing: Following,
            newFollowers: Followers
        }]

        const response = await fetch("/api/FollowUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    AllData: EncryptData(JSON.stringify({ toSendData }))
                }
            )
        })

        const res = await response.json()
        return EncryptData(JSON.stringify(res))
    }

    async UnfollowUser(FriendUsername, Followings) {

        const newFollowing = Followings.filter((data) => {
            return data != FriendUsername
        })

        const toSendData = [{
            Username: this.Username,
            FriendUsername: FriendUsername,
            newFollowing: newFollowing
        }]

        const response = await fetch("/api/Unfollow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    AllData: EncryptData(JSON.stringify({ toSendData }))
                }
            )
        })

        const res = await response.json()
        return EncryptData(JSON.stringify(res))
    }

    async RemoveUser(FriendUsername, Followers) {
        const newFollowers = Followers.filter((data) => {
            return data != FriendUsername
        })

        const toSendData = [{
            Username: this.Username,
            FriendUsername: FriendUsername,
            newFollowers: newFollowers
        }]

        const response = await fetch("/api/RemoveUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    AllData: EncryptData(JSON.stringify({ toSendData }))
                }
            )
        })

        const res = await response.json()
        return EncryptData(JSON.stringify(res))
    }

    async GetPosts(Username) {
        if (Username == "") {
            Username = "*"
        }
        const response = await fetch("/api/GetPosts/" + Username, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        return EncryptData(JSON.stringify(data))
    }
}

export default StaticFunctions