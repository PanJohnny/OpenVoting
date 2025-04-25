// src/pages/api/group-members.js
import { GroupMembershipModel } from "../../util/group_memberships";

export async function GET({ request }) {
    try {
        // Získání query parametrů
        const url = new URL(request.url);
        const groupId = url.searchParams.get("group_id");

        if (!groupId) {
            return new Response(JSON.stringify({ error: "Missing group_id parameter" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Získání členů skupiny
        const members = await GroupMembershipModel.getMembersByGroupId(groupId);

        return new Response(JSON.stringify({ members }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error fetching group members:", error);
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}