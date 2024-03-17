var express = require("express");
var app = express();
var fileuploader = require("express-fileupload");
var mysql = require("mysql2");
var nodemailer = require('nodemailer');
require('dotenv').config();

app.listen(2023, function () {
    console.log("server starteddd!!!!!!!!!!");
});

app.use(express.static("Project_Files"));
app.use(fileuploader());
app.use(express.urlencoded(true));

app.get("/", function (req, resp) {
    resp.send(process.cwd() + "/Project_Files/index.html");
});

//Connect to sql
// var dbConfig = {
//     host: "127.0.0.1",,
//     user: "root",
//     password: "test",
//     database: "bce",
//     dateStrings: true
// };

var dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings : true
}

var dbRef = mysql.createConnection(dbConfig);
dbRef.connect(function (err) {
    if (err == null)
        console.log("Connected successfullyyyyy");

    else
        console.log(err);
});

///===NOdemailer Credentials


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
// ================Index page Sign Up==========================================
app.get("/ajax-signup", function (req, resp) {

    dbRef.query("insert into coustomers(email,pwd,type,dos,status) values (?,?,?,current_date(),1)", [req.query.emailK, req.query.pwdK, req.query.optK], function (err) {
        if (err == null)
            {
                //=============sending Email=================
              
                  
                  var mailOptions = {
                    from: 'nandinijindal010@gmail.com',
                    to: req.query.emailK, 
                    subject: 'Sending Email using Node.js',
                   // text: 'Your are SignedIn at PIllsHaRe'
                   html: "Thank you For visiting PillShArE <br> Login to donate or Take medicines",
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                resp.send("Response saved");
            }
        else
            // resp.send(JSON.stringify(err));
            resp.send("Email Already Exists");
    });

});

//==================================Node mailer=====================================
app.get("/nodemail",function(req,resp){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
      });
      
      var mailOptions = {
        from: 'nandinijindal010@gmail.com',
        to: req.query.emailK, 
        subject: 'Sending Email using Node.js',
       // text: 'Your are SignedIn at PIllsHaRe'
       html: "Thank you For visiting PillShArE <br> Login to donate or Take medicines",
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
})
//=======================Check email in Sign Up===================================

app.get("/chk-email", function (req, resp) {

    dbRef.query("select * from coustomers where email=?", [req.query.key], function (err, resultTable) {
        if (err == null) {
            if (resultTable.length == 1) {
                resp.send("already taken");
            }
            else {
                resp.send("valid");
            }
        }
        else
            resp.send(err);
    });
});

//======================Login button Click=======================================
app.get("/login-ajax", function (req, resp) {
    dbRef.query("select type,status from coustomers where email=? and pwd=?", [req.query.eml, req.query.pd], function (err, resultJsonArray) {
        if (err == null) {
            if (resultJsonArray.length == 1) {
                if (resultJsonArray[0].status == 1)
                    resp.send(resultJsonArray[0].type);
                else
                    resp.send("You are blocked");
            }
            else
                resp.send("Invalid email/password");
        }
        else {
            resp.send(err.toString());
        }
    });
});

//Random For OTP
app.get("/try",function(req,resp){
    console.log("hey");
    var x=Math.random();
    console.log(Math.round(x*10000));
});



//==========================sending otp is forgot password==========================
app.get("/send-otp-password-fgt", function (req, resp) 
{
    dbRef.query("select * from coustomers where email=?", [req.query.fgteml], function (err, resultJsonArray) {
        if (err == null) 
        {
            if (resultJsonArray.length == 1) 
            {
                //=============sending otp at email if email in records=================   
                  var x=Math.random();
                  x=Math.round(x*10000);
                  var mailOptions = {
                    from: 'nandinijindal010@gmail.com',
                    to: req.query.fgteml, 
                    subject: 'Email by PIllsHaRe',
                    html: "Your OTP is " +x+" <br> Please don't share it with others",
                  };

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                  console.log("email is -> "+req.query.fgteml+"otp is -> "+x);
                  var datary=[req.query.fgteml,x];
               resp.send(datary);
            }
            else
                resp.send("Invalid email");
        }
        else {
            resp.send(err.toString());
        }
    });
});

//========================verification of OTP=================================
app.get("/click-submit-after-filling-otp", function (req, resp) 
{
    var otpsent = req.query.otpst;
    var otptxt = req.query.otptx;
    if(otpsent == otptxt)
    {
        dbRef.query("select * from coustomers where email=?", [req.query.key1], function (err, resultTableJson) {
            if (err == null) 
            {
                resp.send("Correct OTP");
            }
            else
                resp.send(err);
        });
    }
    else
    {
        resp.send("Invalid OTP");
    }
});

//======================Reset password on forgot password=====================
app.get("/reset-pwd-in-login", function (req, resp) {
    var newpwd = req.query.np;
    var compwd = req.query.cp;
    console.log(req.query);
   
        if (newpwd == compwd) {
            dbRef.query("update coustomers set pwd=? where email=?", [req.query.np, req.query.eml], function (err, result) {
                if (err == null) 
                {   
                    console.log(result); 
                    resp.send("Updated successfullyyy");
                }
                else 
                {
                    resp.send(err);
                }
            });
        }
        else 
        {
            resp.send("NewPwd and ConfirmPwd should be same");
        }
});
//=====================Donor Profile Information save==========================
app.get("/dashDonor", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/donor-profile.html");
});

app.post("/profile-donor-save", function (req, resp) {
    var filename = "NoPic.jpg";
    if (req.files != null) {
        var filename = req.files.npic.name;
        var path = process.cwd() + "/Project_Files/pics_used/" + filename;
        req.files.npic.mv(path);
    }
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var city = req.body.txtCity;
    var cont = req.body.txtNum;
    var add1 = req.body.txtAdd1;
    var add2 = req.body.txtAdd2;
    var state = req.body.txtState;
    var avail1 = req.body.avail1;
    var avail2 = req.body.avail2;
    var gen = req.body.gender;
    var proof = req.body.proof;
    var avail = avail1 + "-" + avail2;
    console.log(req.body);

    dbRef.query("insert into donors(email,name,city,cont,add1,add2,state,avail_hours,gen,proof_id,picname) values(?,?,?,?,?,?,?,?,?,?,?)", [email, name, city, cont, add1, add2, state, avail, gen, proof, filename], function (err) {
        if (err == null)
            resp.redirect("/DonorSavedPage.html"); // To open new page on Save button click
        else
            resp.send(err);
    });
});
//=======================search button in donor profile=============================
app.get("/get-json-records", function (req, resp) {

    dbRef.query("select * from donors where email=?", [req.query.key1], function (err, resultTableJson) {
        if (err == null) 
        {
            if (resultTableJson.length == 1) {
                resp.send(resultTableJson);
            }
            else {
                resp.send("0");
            }
        }
        else
            resp.send(err);
    });
});
//=====================Donor Profile Information update==========================
app.post("/profile-donor-update", function (req, resp) {
    var filename;
    if (req.files != null) {
        var filename = req.files.npic.name;
        var path = process.cwd() + "/Project_Files/pics_used/" + filename;
        req.files.npic.mv(path);
    }
    else {
        filename = req.body.hdn;
    }

    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var city = req.body.txtCity;
    var cont = req.body.txtNum;
    var add1 = req.body.txtAdd1;
    var add2 = req.body.txtAdd2;
    var state = req.body.txtState;
    var avail1 = req.body.avail1;
    var avail2 = req.body.avail2;
    var gen = req.body.gender;
    var proof = req.body.proof;
    var avail = avail1 + "-" + avail2;
    console.log(req.body);

    dbRef.query("update donors set name=?,city=?,cont=?,add1=?,add2=?,state=?,avail_hours=?,gen=?,proof_id=?,picname=? where email=?", [name, city, cont, add1, add2, state, avail, gen, proof, filename, email], function (err) {
        if (err == null)
            // resp.send("Information Updated successfullyyyy");
            resp.redirect("/DonorUpdatedPage.html");
        else
            resp.send(err);
    });
});

//=====================Avail medicine in donor (avil med)==========================
app.get("/avail-med", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/avail-med.html");
});

app.get("/ajax-avail-med", function (req, resp) {
    dbRef.query("insert into medsavailable values(0,?,?,?,?,?)", [req.query.emailK, req.query.mednK, req.query.expdK, req.query.packK, req.query.quanK], function (err) {
        if (err == null)
            resp.send("Medicines are saved in Records...");
        else
            resp.send(err);
    });
});

//==============================Donor settings==============================
app.get("/donor-settings-update-pwd", function (req, resp) {
    var newpwd = req.query.np;
    var oldpwd = req.query.op;
    var compwd = req.query.cp;

    if (newpwd != oldpwd) {
        if (newpwd == compwd) {
            dbRef.query("update coustomers set pwd=? where email=? and pwd=?", [req.query.np, req.query.email, req.query.op], function (err, result) {
                if (err == null) {
                    if (result.affectedRows == 0) {
                        console.log(result.affectedRows);
                        resp.send("Invalid password");
                    }
                    else {
                        resp.send("Updated successfullyyy");
                    }
                }
                else {
                    resp.send(err);
                }
            });
        }
        else {
            resp.send("NewPwd==ConfirmPwd");
        }
    }
    else {
        resp.send("NewPwd!=OldPwd");
    }
});

//===========================Needy-Profile-Send to server button====================
app.get("/needyprofile", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/needy-profile.html");
});

app.post("/profile-needy-save", function (req, resp) {
    var filename = "NoPic.jpg";
    if (req.files != null) {
        var filename = req.files.npic.name;
        var path = process.cwd() + "/Project_Files/pics_used/" + filename;
        req.files.npic.mv(path);
    }
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var city = req.body.txtCity;
    var cont = req.body.txtNum;
    var add = req.body.txtAdd;
    var dob = req.body.dob;
    var state = req.body.txtState;
    var gen = req.body.gender;
    var proof = req.body.proof;
    console.log(req.body);

    dbRef.query("insert into needy(email,name,cont,city,state,gen,addr,dob,proof_id,picname) values(?,?,?,?,?,?,?,?,?,?)", [email, name, cont, city, state, gen, add, dob, proof, filename], function (err) {
        if (err == null)
            // resp.send("Information saved successfullyyyy");
            resp.redirect("/NeedySavedPage.html");
        else
            resp.send(err);
    });
});

//=======================Fetch button in Needy profile=============================
app.get("/fetch-needy-profile-record", function (req, resp) 
{
    var email = req.query.key1;
    dbRef.query("select * from needy where email=?", [req.query.key1], function (err, resultTableJson) {
        if (err == null) {
            if (resultTableJson.length == 1) {
                resp.send(resultTableJson);
            }
            else {
                resp.send("0");
            }
        }
        else
            resp.send(err);
    });
});
//=====================Needy Profile Information update==========================
app.post("/profile-needy-update", function (req, resp) {
    var filename;
    if (req.files != null) {
        var filename = req.files.npic.name;
        var path = process.cwd() + "/Project_Files/pics_used/" + filename;
        req.files.npic.mv(path);
    }
    else {
        filename = req.body.hdn1;
    }

    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var city = req.body.txtCity;
    var cont = req.body.txtNum;
    var add = req.body.txtAdd;
    var dob = req.body.dob;
    var state = req.body.txtState;
    var gen = req.body.gender;
    var proof = req.body.proof;
    console.log(req.body);

    dbRef.query("update needy set name=?,city=?,cont=?,addr=?,dob=?,state=?,gen=?,proof_id=?,picname=? where email=?", [name, city, cont, add, dob, state, gen, proof, filename, email], function (err) {
        if (err == null)
            // resp.send("Information Updated successfullyyyy");
            resp.redirect("/NeedyUpdatedPage.html");
        else
            resp.send(err);
    });
});

//===================================Needy settings==============================
app.get("/needy-settings-update-pwd", function (req, resp) {
    var newpwd = req.query.np;
    var oldpwd = req.query.op;
    var compwd = req.query.cp;

    if (newpwd != oldpwd) {
        if (newpwd == compwd) {
            dbRef.query("update coustomers set pwd=? where email=? and pwd=?", [req.query.np, req.query.email, req.query.op], function (err, result) {
                if (err == null) {
                    if (result.affectedRows == 0) {
                        console.log(result.affectedRows);
                        resp.send("Invalid password");
                    }
                    else {
                        resp.send("Updated successfullyyy");
                    }
                }
                else {
                    resp.send(err);
                }
            });
        }
        else {
            resp.send("NewPwd==ConfirmPwd");
        }
    }
    else {
        resp.send("NewPwd!=OldPwd");
    }
});

//=========================Angular SHOW Users in Users panel========================
app.get("/panel-users", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/panel-users.html");
});

app.get("/angular-fetch-users", function (req, resp) {
    dbRef.query("select * from coustomers", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//========================Angular BLock users in Users panel======================
app.get("/angular-users-block", function (req, resp) {
    var email = req.query.emailK;
    dbRef.query("update coustomers set status=? where email=?", [0, email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Blocked");

            else
                resp.send("Invalid Email");
        }
        else
            resp.send(err);
    });
});

//===========================Angular UnbLock users in Users panel======================
app.get("/angular-users-Unblock", function (req, resp) {
    var email = req.query.emailK;
    dbRef.query("update coustomers set status=? where email=?", [1, email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Unblocked");

            else
                resp.send("Invalid Email");
        }
        else
            resp.send(err);
    });
});

//===========================Angular Delete users in Users panel======================
app.get("/angular-users-delete-adminPanel", function (req, resp) {
    var email = req.query.emailK;
    dbRef.query("delete from coustomers where email=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Deleted");

            else
                resp.send("Invalid Email");
        }
        else
            resp.send(err);
    });
});

//=========================Angular SHOW DONORS in Donor panel========================
app.get("/panel-donors", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/panel-donors.html");
});

app.get("/angular-fetch-donors", function (req, resp) {
    dbRef.query("select * from donors", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//=========================Angular Delete donors=================================
app.get("/angular-delete-donors", function (req, resp) {
    var email = req.query.emailK;
    dbRef.query("delete from donors where email=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("Infomation Deleted successfullyyyyyy!!!");
            }
            else {
                resp.send("Invalid Email");
            }
        }
        else
            resp.send(err);
    });
});

//=========================Angular SHOW NEEDYS in needy panel========================
app.get("/panel-needys", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/panel-needys.html");
});

app.get("/angular-fetch-needys", function (req, resp) {
    dbRef.query("select * from needy", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//=========================Angular Delete Needy=================================
app.get("/angular-delete-needys", function (req, resp) {
    var email = req.query.emailK;
    dbRef.query("delete from needy where email=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("Infomation Deleted successfullyyyyyy!!!");
            }
            else {
                resp.send("Invalid Email");
            }
        }
        else
            resp.send(err);
    });
});

// =========================Angular In admin-dash=show all meds=====================
app.get("/AllMeds", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/dash-admin.html");
});

app.get("/angular-fetch-All-med-in-admin", function (req, resp) {
    dbRef.query("select * from medsavailable", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//====================Angular delete all exp medicines from admin dash===============
app.get("/delete-expMedicines", function (req, resp) {
    dbRef.query("delete from medsavailable where expdate<=current_date()", function (err) {
        if (err == null)
            resp.send("updated successfully");

        else
            resp.send(err);
    });
});

//=========================Angular SHOW All medicines Available========================
app.get("/Med-avail", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/med-manager.html");
});

app.get("/angular-fetch-avail-med", function (req, resp) {
    dbRef.query("select * from medsavailable where email=?", [req.query.emailk], function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//=========================Angular Delete medicines available=================================
app.get("/angular-delete-med", function (req, resp) {
    var sno = req.query.snok;
    dbRef.query("delete from medsavailable where srno=?", [sno], function (err, result) {
        if (err == null) {
            resp.send("Deleted sccessfully");
        }
        else
            resp.send(err);
    });
});

//==========================Medicine-finder=City of combo==========================
app.get("/med-finder", function (req, resp) {
    resp.sendFile(process.cwd() + "/Project_Files/finder-med.html");
});
app.get("/fetch-city-donors", function (req, resp) {
    dbRef.query("select distinct city from donors", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//============================Medicine-finder=avalable medicines combo==============
app.get("/fetch-meds-donated-by-donors", function (req, resp) {
    dbRef.query("select distinct med from medsavailable", function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});

//==========================Medicine-finder=Fetch donors==========================
app.get("/fetch-Donors-In-MedFinder", function (req, resp) {
    var med = req.query.medK;
    var city = req.query.cityK;
    var query = "select donors.email,donors.name,donors.city,donors.state,donors.cont,donors.add1,donors.email,donors.avail_hours,donors.gen,medsavailable.med,medsavailable.packing,medsavailable.expdate,medsavailable.qty from donors inner join medsavailable on donors.email= medsavailable.email where medsavailable.med=? and donors.city=?";
    dbRef.query(query, [med, city], function (err, resultTableJson) {
        if (err == null)
            resp.send(resultTableJson);

        else
            resp.send(err);
    });
});
