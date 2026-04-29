import { Alert, Button, Stack, TextField } from "@mui/material";
import { applyActionCode, checkActionCode, confirmPasswordReset, verifyPasswordResetCode, type Auth } from "firebase/auth";
import { auth } from "../../firebase"; 
import { useEffect, useState } from "react";


const UserVer = () => {
  const [message, setMessage] = useState("Loading...");
  const [verIcon, setVerIcon] = useState<{sev: "success" | "error" | "info"}>({sev: "info"});

  // Check URL for params
  const getParameterByName = (label: string) => {
      let params = new URLSearchParams(document.location.search);      
      return params.get(label);
  }

  // Get the action to complete.
  const mode = getParameterByName('mode');
  // Get the one-time code from the query parameter.
  const actionCode = getParameterByName('oobCode');
  // (Optional) Get the continue URL from the query parameter if available.
  const continueUrl = getParameterByName('continueUrl');
  // (Optional) Get the language code if available.
  const lang = getParameterByName('lang');


  // Returns UI for user wanting to update their email
  const handleVerifyAndChangeEmail = (auth: Auth, actionCode: string, continueUrl: string, lang: string) => {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    useEffect(() => {
      // Check metadata about the code sent
      checkActionCode(auth, actionCode).then(async (res) => {
        let oldEmail = res.data.previousEmail;
        let newData = { email: res.data.email };
        await applyActionCode(auth, actionCode).then(async (resp) => {
          // Email address has been verified and changed in Firebase.
          // Change email in mongodb
          await fetch("/api/users/ver/" + oldEmail, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({newData}),  
          }).then (async (ures) => {
              const tmp = await ures.json();  // SUCCESS
              setMessage("Email updated successfully! You can now login as " + res.data.email);
              setVerIcon({sev: "success"});
            });
        }).catch((error) => {
            // Code is invalid or expired. Ask the user to verify their email address
            // again.
            setMessage(error.message);
            setVerIcon({sev: "error"});
            console.log(error);
          })
      }).catch((error) => {
          // Code is invalid or expired. Ask the user to verify their email address
          // again.
          setMessage(error.message);
          setVerIcon({sev: "error"});
          console.log(error);
        });
    }, []);


    // Build UI
    return(
      <>
        <Stack alignItems={"center"} padding={3} spacing={2}>
          <Alert severity={verIcon.sev}>{message}</Alert>
          <Button variant="contained" href={continueUrl}>Return to Fogarty Homepage</Button>
        </Stack>
      </>
    )
  }

  // Returns UI for user wanting to verify their email
  const handleVerifyEmail = (auth: Auth, actionCode: string, continueUrl: string, lang: string) => {
    useEffect(() => {
      // check actionCode to get verified email
      checkActionCode(auth, actionCode).then(async (res) => {
        let email = res.data.email;
        // apply action code
          applyActionCode(auth, actionCode).then(async (resp) => {
          setMessage("Success! You can now login as " + email);
          setVerIcon({sev: "success"});
          console.log("Success");
        }).catch((error) => {
          // Code is invalid or expired. Ask the user to verify their email address again. (applyActionCode)
          setMessage(error.message);
          setVerIcon({sev: "error"});
          console.log(error);
        });;
      }).catch((error) => {
        // Code is invalid or expired. Ask the user to verify their email address again. (checkActionCode)
        setMessage(error.message);
        setVerIcon({sev: "error"});
        console.log(error);
      });
    }, [])
        
    
    return(
      <>
        <Stack alignItems={"center"} padding={3} spacing={2}>
          <Alert severity={verIcon.sev}>{message}</Alert>
          <Button variant="contained" href={continueUrl}>Return to Fogarty Homepage</Button>
        </Stack>
      </>
    )
  }

  // function to check and apply the new password
  const handleResetPassword = (auth: Auth, actionCode: string, continueUrl: string, lang: string) => {
    const [buff1, setBuff1] = useState(""); // password
    const [disableButton, setDisableButton] = useState(true);
    const passwordRegex = /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/;

    const checkRegex = (userInput: string) => {
      setBuff1(userInput);
      const result = passwordRegex.test(userInput);
      result ? setDisableButton(false) : setDisableButton(true); // True means pass/valid input, should allow it
    }

    const handleUpdatePassword = (e: React.FormEvent) => {
      e.preventDefault();
      // check actionCode if valid
      verifyPasswordResetCode(auth, actionCode).then(() => {
        // apply action code and update password
        confirmPasswordReset(auth, actionCode, buff1.trim()).then(() => {
          setMessage("Success! You can now login with the new password.");
          setVerIcon({sev: "success"});
        }).catch((error) => {
          // Code is invalid or expired. Ask the user to verify their email address again. (applyActionCode)
          setMessage(error.message);
          setVerIcon({sev: "error"});
          console.log(error);
        });
      }).catch((error) => {
        // Code is invalid or expired. Ask the user to verify their email address again. (checkActionCode)
        setMessage(error.message);
        setVerIcon({sev: "error"});
        console.log(error);
      });

      // clear buffers
      setBuff1("");
      setDisableButton(true);
    }

    
    return(
      <>
        <Stack alignItems={"center"} padding={3} spacing={2}>
          <Alert severity={verIcon.sev}>{message}</Alert>
          <form style={{ width: '50%', marginTop: '1rem' }} onSubmit={(e) => handleUpdatePassword(e)}>
              <TextField variant="outlined" margin="normal" required fullWidth label="New Password" name="password" type="password"
                  value={buff1}
                  onChange={(e) => checkRegex(e.target.value)}
                  helperText={disableButton ? "Password must be at least 12 characters long and include at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters."
                  : ""}
              />
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} 
                disabled={disableButton}
              >
                  Set Password
              </Button>
          </form>
          <Button variant="contained" href={continueUrl}>Return to Fogarty Homepage</Button>
        </Stack>
      </>
    )
  }


  // Handle the user management action.
  // VERIFY_AND_CHANGE_EMAIL, VERIFY_EMAIL
  // TODO: PASSWORD_RESET
  let UI;
  switch (mode) {
    case 'verifyAndChangeEmail':
      // Display update email verification handler and UI.
      UI = handleVerifyAndChangeEmail(auth, actionCode || "", continueUrl || "http://localhost:5173/", lang || "en");
      break;
    case 'resetPassword':
      // Display reset password verification handler and UI
      useEffect(() => {
        setMessage("Please enter a new password");
      }, [])
      UI = handleResetPassword(auth, actionCode || "", continueUrl || "http://localhost:5173/", lang || "en");
      break;
    case 'verifyEmail':
      // Display verify email verification handler and UI
      UI = handleVerifyEmail(auth, actionCode || "", continueUrl || "http://localhost:5173/", lang || "en");
      break; 
    default:
      break;
  }

  
  // UI changes depending on the mode
  return (
    <>
      {UI}
    </>
  )
}


export default UserVer;