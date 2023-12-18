class FaunaClient {
    constructor(key) {
      this.key = key;
      this.url = process.env.FAUNA_URL || 'https://db.fauna.com/query/1';
    }
  
    async query(fql_expression) {
      try {
        if (!this.key) {
          throw new Error("Please provide a valid key");
        }
        
        const response = await fetch(this.url, {
          method: "POST",
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${this.key}`,
            "x-format": "simple",
            "x-typecheck": "false"
          },
          body: JSON.stringify({
            query: fql_expression,
            arguments: {},
          }),
          mode: "cors",
          credentials: "include",
        });

        if (!response.ok) {
            console.log("fql_expression", fql_expression);
            throw new Error(`FaunaDB query failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        throw new Error(`FaunaDB query error: ${error.message}`);
      }
    }
}

module.exports = {
  FaunaClient
};
