import PipeBomb from "pipebomb.js";

onmessage = e => {
    const hash = e.data;
    try {
        const start = Date.now();
        const key = PipeBomb.generatePrivateKey(hash);
        const response = {
            time: Date.now() - start,
            privateKey: key
        }
        postMessage(response);
    } catch (e) {
        console.error("Error generating account keys", e);
        postMessage({"error": true});
    }
    
}