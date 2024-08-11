const pathName = "/api/authentication"
console.log(Backend.Auth)

Backend.Auth.signup = async function (firstName, lastName, email, password) {
    try {
      const url = new URL("http://localhost:3000"+ pathName + "/signup");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
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
      const url = new URL("http://localhost:3000"+ pathName + "/login");

      const response = await fetch(url, {
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

Backend.Auth.googleAuth = async function () {
  try {
    const url = new URL("http://localhost:3000"+ pathName + "/google");

    const response = await fetch(url, {
      method: "GET",
    });

    window.location.href = response.url;

  } catch (error) {

    console.log("Error:", error);
    
  }
};

Backend.Auth.logout = async function () {
  try {
      const url = new URL("http://localhost:3000" + pathName + "/logout");

      const response = await fetch(url, {
          method: "GET",
          credentials: 'include' // This is important for including cookies in the request
      });

      const result = await response.json();

      console.log({ result: result, status: response.status });

      if (response.status === 200) {
          // Redirect here in the client-side code
          alert("Successfully logged out")
          window.location.href = '/login';
          return { result: result, status: response.status };
      } else {
          throw new Error(result.error || 'Logout failed');
      }

  } catch (error) {
      console.log("Error:", error);
      throw error; // Re-throw the error so it can be caught in the calling function
  }
};
