const pathname = "/api/authentication"
console.log(Backend.Auth)

Backend.Auth.signup = async function (email, password) {
    try {
      const response = await fetch("http://127.0.0.1:3000"+ pathname + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
      console.log({ result: result, status: response.status });
      return { result: result, status: response.status };
    } catch (error) {
      console.log("Error:", error);
    }
  };


Backend.Auth.login = async function (email, password) {
    try {
      const response = await fetch("http://127.0.0.1:3000"+ pathname + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
      console.log({ result: result, status: response.status });
      return { result: result, status: response.status };
    } catch (error) {
      console.log("Error:", error);
    }
};

