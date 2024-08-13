const authBackendPath = "/api/authentication"

Backend.Auth.signup = async function (firstName, lastName, email, password) {
    try {
      const url = new URL(serverPath + backendPath + "/signup");

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
      const url = new URL(serverPath + backendPath + "/login");

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
    const url = new URL(serverPath + backendPath + "/google");

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
      const url = new URL(serverPath + backendPath + "/logout");

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

Backend.Auth.setupMFA = async function () {
  try {
    const url = new URL(serverPath + backendPath + "/setup-mfa");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    
    console.log({ result: result, status: response.status });

    return { status: response.status, ...result };  // Contains QR code image URL and secret

  } catch (error) {
    console.log("Error setting up MFA:", error);
  }
};

Backend.Auth.enableMFA = async function (token) {
  try {
    const url = new URL(serverPath + backendPath + "/enable-mfa");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { status: response.status, ...result }; 

  } catch (error) {
    console.log("Error enabling MFA:", error);
    throw error;
  }
};

Backend.Auth.verifyMFA = async function (token) {
  try {
    const url = new URL(serverPath + backendPath + "/verify-mfa");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { status: response.status, ...result }; 

  } catch (error) {
    console.log("Error enabling MFA:", error);
    throw error;
  }
};

Backend.Auth.requestPasswordReset = async function (email) {
  try {
    const url = new URL(serverPath + backendPath + "/request-password-reset");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { status: response.status, ...result }; 

  } catch (error) {
    console.log("Error requesting password reset:", error);
    throw error;
  }
};

Backend.Auth.validateResetPasswordLink = async function (token, email) {
  try {
    const url = new URL(serverPath + backendPath + "/reset-password");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { status: response.status, ...result }; 

  } catch (error) {
    console.log("Error requesting password reset:", error);
    throw error;
  }
};

Backend.Auth.updateNewPassword = async function (token, email, password) {
  try {
    const url = new URL(serverPath + backendPath + "/update-new-password");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email, password }),
    });

    const result = await response.json();

    console.log({ result: result, status: response.status });

    return { status: response.status, ...result }; 

  } catch (error) {
    console.log("Error updating password:", error);
    throw error;
  }
};