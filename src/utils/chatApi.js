export const sendQueryToAPI = async (query, session_id) => {
    try {
        const response = await fetch("http://172.203.248.99:8000/axim/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, session_id }),
        });

        if (!response.ok || !response.body) {
            throw new Error("Failed to fetch or no response body");
        }

        return response.body;
    } catch (error) {
        console.error("Chat API streaming error:", error);
        throw new Error("Streaming error");
    }
};  