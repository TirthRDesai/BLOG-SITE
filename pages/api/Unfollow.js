import { handleFollowAction } from "@/lib/follow"

export default function handler(req, res) {
    return handleFollowAction(req, res, "unfollow")
}
