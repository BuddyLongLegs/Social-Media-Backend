# Social-Media-Backend

Hosted On: [https://bll-webd-select.herokuapp.com/](https://bll-webd-select.herokuapp.com/)

### Signing Up

Before anything to do, you would like sign up to the social media platform. Resquest Structure for signing up is as follows:
>#### Request
>URI: `/signup`\
>Allowed Content Types: `Apllication/JSON` and `Application/x-www-form-urlencoded`\
>Method: `POST`\
>Body:
>```json
>{
>   "email"    : "youremail@addr.ess",
>   "password" : "yoUr_PassWord",
>   "username" : "user_name",
>   "name"     : "Your Name",
>   "bio"      : "(Optional) About You"
> }
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "Account Created Successfully",
>   "data"      : {
>                   "username"  : "user_name",
>                   "name"      : "Your Name"  
>                 },
>   "secret"    : "javascriptwebtoken"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```


---

### Logging In

Get new Authorization token for API usage
>#### Request
>URI: `/login`\
>Allowed Content Types: `Apllication/JSON` and `Application/x-www-form-urlencoded`\
>Method: `POST`\
>Body:
>```json
>{
>   "email"    : "youremail@addr.ess",
>   "password" : "yoUr_PassWord"
> }
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "Account Created Successfully",
>   "data"      : {
>                   "username"  : "user_name",
>                   "name"      : "Your Name",
>                   "profile"   : "Link to Profile Image"
>                 },
>   "secret"    : "javascriptwebtoken"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```


---
### Google Authentication

For getting Authorization token via verifying your account through your google account. The final response after successfull authorization is a JavaScript Script to save the JWT into the localStorage under the keyname  `secret` and then close the window.
>#### Request
>URI: `/login/google`\
>Method: `GET`


>#### Response
>**Successfull Response**\
>Response URI: `/auth/google/callback`\
>Response Content Type: `text/html`
>```html
><script defer>
>   localStorage.setItem("secret", "javascriptwebtoken");
>   window.close()
></script>
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```html
><script defer>
>   window.close()
></script>
>```

>#### Preferred HTML structure for Google Auth request
>```html
><button onclick="signin();">Sign In with Google</button>
><script>
>    var x = screen.width/2 - 500/2;
>    var y = screen.height/2 - 500/2;
> 
>    function signin(){
>        window.open('/login/google', 'signinwithgoogle', 'width=500, height=500, left='+x+', top='+y);
>    }
></script>
>```

---


>### Authentication Method
>
>On successful authorization using uris `/login` and `/signup` the response comes with a secret which is JavaScript Web Token which will be used to authenticate the user with each request. For authorization using `/login/google`, the token is saved in the localStorage under the keyname `secret`. This token has an expiry of 1 month.
>
>**Sending Auth Token for restricted routes**\
>For request authentication the secret token is need to be sent with the response. It can be sent in any of the following ways:
>##### As Request Header
>```json
>{
>  "headers" : {
>      "secret" : "javascriptwebtoken",
>    }    
>}
>```
>---
>##### As Authorization Bearer Token
>```json
>{
>  "headers" : {
>      "Authorization" : "Bearer javascriptwebtoken",
>    }    
>}
>```
>---
>##### As a Field in Body
>```json
>{
>  "body" : {
>      "secret" : "javascriptwebtoken",
>    }    
>}
>```

---


### Restrictions
The routes may have 3 types of restrictions, they are:
1. *No Restriction*
2. *Authorization Required*
3. *Authorization Required with Completed Profile*

<dl>
  <dt><strong>No Restriction</strong></dt>
  <dd>There is no restriction on the route and everyone has access to the route.</dd>
  <dt><strong>Authorization Required</strong></dt>
  <dd>You need an account to access the route and you can only access the route by providing the authorization token with the request.</dd>
  <dt><strong>Authorization Required with Completed Profile</strong></dt>
  <dd>You need an account with completed profile to access this route, i.e., your account should be verified and your account must have username. You can only access the route by providing the authorization token with the request.</dd>
</dl>

---

## User Profile Related Routes

---

### Request for Email Verification
By default when creating account via `/signup` or updating the email address later, the account status is set to unverified and you will have to verify your email to set your account status to verified. Sending a GET request to this route will generate an OTP which will be sent to the logged in user's email address. This OTP will be used later to verify the user's email address. This should be remembered that the OTP is only valid for 10 minutes.

>#### Request
>URI: `/verifyemail/request`\
>Method: `GET`\
>Restrictions: `Authorization Required`

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "OTP sent Successfully"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Email Verification
To verify the email verification OTP and set the account status to verified.

>#### Request
>URI: `/verifyemail`\
>Method: `PATCH`\
>Allowed Content Types: `Apllication/JSON` and `Application/x-www-form-urlencoded`\
>Restrictions: `Authorization Required`
>BODY:
>```json
>{
>   "code"   : "6 digit OTP"
>}
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "User Email Verified"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Request for Password Change
It is very usual that a user may forget his/her password. Request for Password change via this route. This will generate a 6 digit OTP that will required with the new password later for changing the password. The expiry of the OTP is 5 mins.

>#### Request
>URI: `/changepassword/request`\
>Method: `POST`\
>Allowed Content Types: `Apllication/JSON` and `Application/x-www-form-urlencoded`\
>Restrictions: `No Restriction`
>BODY:
>```json
>{
>   "email"   : "youremail@addr.ess"
>}
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "OTP sent Successfully"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Change Password
Create a new password and send it via `PATCH` request along with the Password Change OTP.

>#### Request
>URI: `/changepassword/request`\
>Method: `PATCH`\
>Allowed Content Types: `Apllication/JSON` and `Application/x-www-form-urlencoded`\
>Restrictions: `No Restriction`
>BODY:
>```json
>{
>   "email"   : "youremail@addr.ess",
>   "password": "Your New PassWord",
>   "code"    : "6 digit OTP"
>}
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `201`
>```json
>{
>   "message"   : "Password changed successfully"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Search a User

Search a user using a query string, paginated response will contain list of top 20 users with relating name or username.

>#### Request
>URI: `/search`\
>Method: `GET`\
>Restrictions: `No Restriction`\
>Query Structure:
>```json
>{
>   "uri" : "/search?q=user&page=1&perpage=20",
>   "Query Parameters"  :   {
>       "q"         : "query string",
>       "page"      : "(optional) result page number, default=1",
>       "perpage"   : "(optional) number of results per page, default=20"
>   }
>}
>```

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `200`
>```json
>{
>   "docs" : [{ 
>               "username"  : "username",
>               "name"      : "User's name",
>               "profile"   : "link to User's profile picture"
>            }],
>   "totalDocs"  : "total number of results",
>   "limit"      : "users per page",
>   "hasPrevPage": "Availability of prev page",
>   "hasNextPage": "Availability of next page",
>   "page"       : "Current page number",
>   "totalPages" : "Total number of pages",
>   "prevPage"   : "Prev page number if available or NULL",
>   "nextPage"   : "Next page number if available or NULL"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Get a User's Details
Checking the profile of a user. Give the username of the user to get his/her details.

>#### Request
>URI: `/<username>`\
>Method: `GET`\
>Restrictions: `No Restriction`

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `200`
>```json
>{
>   "username"    : "user_name",
>   "name"        : "User's Name",
>   "postNum"     : "the number of posts the user have posted",
>   "followerNum" : "the number of followers user have",
>   "followingNum": "the number of users the user has followed",
>   "bio"         : "the user's self decription",
>   "profile"     : "link to User's profile picture"
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

### Follow a User
Follow a user of your choice


>#### Request
>URI: `/<username>/follow`\
>Method: `POST`\
>Restrictions: `Authorization Required with Completed Profile`

>#### Response
>**Successfull Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `200`
>```json
>{
>   "message": "followed successfully",
>   "data"   : {
>       "followedUser":{
>           "username"      : "followed username",
>           "name"          : "followed user's name",
>           "postNum"       : "followed user's number of post",
>           "followerNum"   : "followed user number of followers",
>           "followingNum"  : "followed user number of following",
>           "profile"       : "link to followed user profile picture"
>       },
>       "self": {
>           "username"      : "username",
>           "name"          : "user's name",
>           "postNum"       : "user's number of post",
>           "followerNum"   : "user's number of followers",
>           "followingNum"  : "user's number of following",
>           "profile"       : "link to user's profile picture"
>       }
>   }
>}
>```
>**Error Response**\
>Response Content Type: `Application/JSON`\
>Response Code: `4xx` or `5xx`
>```json
>{
>   "error"   : "Error Message"
>}
>```

---

!! Docs are incomplete
