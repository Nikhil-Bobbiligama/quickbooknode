var tools = require('../tools/tools.js')
var config = require('../config.json')
var request = require('request')
var express = require('express')
var router = express.Router();


/** /api_call **/
router.get('/', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})
  if(!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })

  // Set up API call (with OAuth2 accessToken)
  // var url = config.api_uri + req.session.realmId + '/companyinfo/' + req.session.realmId
  var url = config.api_uri + req.session.realmId + '/query?query=Select * from Customer'
  console.log("type of access.token")
  console.log(typeof(token.accessToken));

  console.log('Making API call to: ' + url)
  var requestObj = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Accept': 'application/json'
    }
  }

  // Make API call
  request(requestObj, function (err, response) {
   console.log("check response for api call")
   console.log(response.body)
   res.send(response.body)
  //  res.redirect('/refresh')
    // Check if 401 response was returned - refresh tokens if so!
    // tools.checkForUnauthorized(req, requestObj, err, response).then(function ({err, response}) {
    //   if(err || response.statusCode != 200) {
    //     return res.json({error: err, statusCode: response.statusCode})
    //   }

    //   // API Call was a success!
    //   res.json(JSON.parse(response.body))
    // }, function (err) {
    //   console.log(err)
    //   return res.json(err)
    // })
  })
})
///////////////////////
router.post('/addcustomer', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})
  if(!req.session.realmId) return res.json({
    error: 'No realm ID.  QBO calls only work if the accounting scope was passed!'
  })

  // Set up API call (with OAuth2 accessToken)
  // var url = config.api_uri + req.session.realmId + '/companyinfo/' + req.session.realmId
  var url1 = config.api_uri + req.session.realmId + '/customer'

  console.log('Making API call to: ' + url1)
  console.log("token:::::::::"+token.accessToken)
  var requestObj = {
    url: url1,
    headers: {
      'Authorization': 'Bearer ' + token.accessToken,
      'Accept': 'application/json'
    },
    // method:'POST',
    body:{
      "BillAddr": {
          "Line1": "123 Main Street",
          "City": "Mountain View",
          "Country": "USA",
          "CountrySubDivisionCode": "CA",
          "PostalCode": "94042"
      },
      "Notes": "Here are other details.",
      "Title": "Mr",
      "GivenName": "Jamess",
      "MiddleName": "Bs",
      "FamilyName": "Kings",
      "Suffix": "Jr",
      "FullyQualifiedName": "King Grocerieesspppppp",
      "CompanyName": "King Grocerieesspppppp",
      "DisplayName": "King's Grocerieessppppppppp",
      "PrimaryPhone": {
          "FreeFormNumber": "(--91) 555-5555"
      },
      "PrimaryEmailAddr": {
          "Address": "jdrew@myemail.com"
      }
  }
  
  }
  // JSON.stringify(my_details);
  
  console.log(requestobj2)
  // Make API call
  console.log("add customer before error check")
  // request.post(requestobj2, function (err, response) {
  //   console.log("check response for api call")
  //   // console.log(response.body)
  //   // res.send(response.body)
  //   console.log("check body for add customer call")
  // console.log(response)})
   var body1={
    "BillAddr": {
        "Line1": "123 Main Street",
        "City": "Mountain View",
        "Country": "USA",
        "CountrySubDivisionCode": "CA",
        "PostalCode": "94042"
    },
    "Notes": "Here are other details.",
    "Title": "Mr",
    "GivenName": "Jamess",
    "MiddleName": "Bs",
    "FamilyName": "Kings",
    "Suffix": "Jr",
    "FullyQualifiedName": "King Grocerieesspppppp",
    "CompanyName": "King Grocerieesspppppp",
    "DisplayName": "King's Grocerieessppppppppp",
    "PrimaryPhone": {
        "FreeFormNumber": "(--91) 555-5555"
    },
    "PrimaryEmailAddr": {
        "Address": "jdrew@myemail.com"
    }
}
var requestobj2=JSON.stringify(body1);
  request.post({
    url: url1,
    auth: {
      'bearer': token.accessToken
    },
    json:body1

  }, function(err, res) {
    console.log(res);
    res.redirect('/refresh')
  });
})
    // console.log(body)
    // Check if 401 response was returned - refresh tokens if so!
    // tools.checkForUnauthorized(req, requestObj, err, response).then(function ({err, response}) {
    //   console.log(" check status code")
    //   console.log(response.statusCode)
    //   if(err || response.statusCode != 200) {
    //     return res.json({error: err, statusCode: response.statusCode})
    //   }

    //   // API Call was a success!
    //   console.log("post request success")
    //   res.json(JSON.parse(response.body))
    // }, function (err) {
    //   console.log(err)
    //   return res.json(err)
    // })
  // })


/** /api_call/revoke **/
router.get('/revoke', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})

  var url = tools.revoke_uri
  request({
    url: url,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + tools.basicAuth,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'token': token.accessToken
    })
  }, function (err, response, body) {
    if(err || response.statusCode != 200) {
      return res.json({error: err, statusCode: response.statusCode})
    }
    tools.clearToken(req.session)
    res.json({response: "Revoke successful"})
    res.redirect('/refresh')
  })
})

/** /api_call/refresh **/
// Note: typical use case would be to refresh the tokens internally (not an API call)
// We recommend refreshing upon receiving a 401 Unauthorized response from Intuit.
// A working example of this can be seen above: `/api_call`
router.get('/refresh', function (req, res) {
  var token = tools.getToken(req.session)
  if(!token) return res.json({error: 'Not authorized'})

  tools.refreshTokens(req.session).then(function(newToken) {
    // We have new tokens!
    res.json({
      accessToken: newToken.accessToken,
      refreshToken: newToken.refreshToken
    })
  }, function(err) {
    // Did we try to call refresh on an old token?
    console.log(err)
    res.json(err)
  })
})

module.exports = router
