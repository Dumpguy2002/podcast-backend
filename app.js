const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://Abidsyed25:Ab1d$yed@cluster0.5ditsyk.mongodb.net/Podcast?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const userSchema = new mongoose.Schema({
  fname: {type: String,
    required: true
},
  lname:{type: String,
  required: true}
,
  email: {type: String,
    required: true,
    unique: true
},
  password:{type: String,
    required: true
},
fav: {
  type: [Number]  // This defines an array of strings
}
  
});

const podcastSchema = new mongoose.Schema({
    num:{type:Number,required:true},
    title: {type: String,
      required: true
  },
    description:{type: String,
    required: true}
  ,
    speaker: {type: String,
      required: true
  },
  category: {type: String,
    required: true
},
    source:{type: String,
      required: true
  },
  });

const users = new mongoose.model('users', userSchema);
const podcasts = new mongoose.model('podcasts', podcastSchema);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
const  getStat = require('util').promisify(fs.stat);
let arr = [{id:1,title:'Engineering',created:'Abid'},{id:2,title:'Engineering',created:'Syed'},{id:3,title:'Engineering',created:'Sai'},{id:4,title:'Engineering',created:'Yuva'},{id:5,title:'Engineering',created:'Kiran'},{id:6,title:'Engineering',created:'puri'},{id:7,title:'Engineering',created:'cbn'},{id:8,title:'Engineering',created:'jagan'}]
let user = [{name:'Abid Syed',password:'123456'}];

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // You need to create this 'uploads' directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 files are allowed.'), false);
    }
  };
  
const upload = multer({ storage:storage, fileFilter });
  

app.get("/",async (req,res) => {
  

  // return res.json({hi:'op'});
  try{
    const pd = await podcasts.find().sort({ _id: -1 }).limit(10);
    console.log(pd[0]);
    res.json(pd);
  }catch(e){
    res.json({error:'true'});
  }
    
})
// app.get("/music",async (req,res) => {


//   // return res.json({hi:'op'});
//   try{
//     const pd = await podcasts.find({category:'music'}).sort({ _id: -1 }).limit(10);
//     console.log(pd[0]);
//     res.json(pd);
//   }catch(e){
//     res.json({error:'true'});
//   }
    
// })

app.post("/login",async(req,res) => {
    try{
    console.log(req.body);
    // if(req.body.password == users[0].password){
    //    var token = jwt.sign({id:1},"secretkey");
    //    res.json({token
    //     :token});
    // }
    // else{
    //     res.json({error:'invalid'});
    // }
    const acc = await users.find({email:req.body.username});
    if(acc[0].password === req.body.password){
        var token = jwt.sign({email:acc[0].email},"secretkey");
        res.json({token:token});

    }
    else{
    console.log(acc[0].password);
    res.json({error:'true'});
    }
    }catch(e){
        console.log(e);
    }
})

app.get("/admin",async (req,res) => {
    //const id = jwt.verify(req.cookies.id,"secretkey");
    try{
    if(req.query.token){
        const email = jwt.verify(req.query.token,"secretkey");
        const acc = await users.find({email:email.email});
        console.log(acc);
        
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials',true);
        res.json({fn:acc[0].fname,ln:acc[0].lname});
       // console.log(id);
    }
    }
    catch(e){
        console.log("hi");
        res.json({error:'true'});
    }
    
})

app.post('/signup',(req,res) => {
    const formDat = req.body;
    console.log(req.body);
    const newUser = new users({
        fname:formDat.fname,
        lname: formDat.lname,
        email: formDat.email,
        password:formDat.pass,
      });
      
      newUser.save()
        .then((user) => {
          console.log('User saved:', user);
          res.json({name:'ki'});
        })
        .catch((error) => {
          console.error('Error saving user:', error);
          res.json({error:'true'});
        });
    

    
})

app.post("/podcast",upload.single('file'),async (req,res) => {
    
    // console.log('hi');
    // res.json({hi:'hello'});
    try{
      const pd = await podcasts.find().sort({ _id: -1 }).limit(1);
      
      let v ;
      if(pd.length == 0){v = 1;}
      else{
        v = pd[0].num+1;
      }
    const formData = req.body;
    const path = "http://localhost:8000/podcast/" + req.file.originalname;
    console.log(req.body);
    console.log(req.body.title);
    const podcast = new podcasts({
        num:v,
        title:formData.title,
        description: formData.description,
        speaker: formData.speaker,
        category:formData.category,
        source:path,
      });
      
      podcast.save()
        .then((user) => {
          console.log('User saved:', user);
          res.json({name:'ki'});
        })
        .catch((error) => {
          console.error('Error saving user:', error);
          res.json({error:'true'});
        });
      }catch(e){
      
      }
    
})

app.get("/main/:id",async (req,res) => {
  const id = req.params.id; // Access the id from the URL

  console.log(id); // Log the id to the console
  

  // You can now use the 'id' variable to query your database, for example:
  try {
    const pd = await podcasts.find({ num: id });
    //console.log(pd);
    res.json(pd);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Unable to fetch data' });
  }

})

app.get("/podcast/:name", async (req, res) => {
  
    const name = req.params.name;
    const filePath = `./uploads/${name}`; // Fix the path to the file
    
    const stat = await getStat(filePath);
    
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials':true,
      'Content-Type': 'audio/mp3',
      'Accept-Ranges': 'bytes',
      'Connection': 'Keep-Alive',
      'Transfer-Encoding': 'chunked', // Fixed typo in Transfer-Encoding
      'Content-Length': stat.size.toString(), // Convert size to string
    });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (error) => {
      console.error('Error reading the file:', error);
      res.status(500).json({ error: 'Error reading the file' });
    });

    stream.pipe(res);
  
})

app.get("/search",async (req,res) => {
      console.log(req.query.query);
      const result = await podcasts.find({title: {$regex: req.query.query, $options: 'i'}}).limit(10);
      res.json(result);
})

app.post("/fav",async (req,res) => {
  console.log(req.body.token);
  if (req.body.token) {
    const email = jwt.verify(req.body.token, "secretkey");

    // Find the user document based on the email
    const user = await users.findOne({ email: email.email });
  
    if (user) {
      // Update the array field (e.g., scores)
      const numIndex = user.fav.indexOf(req.body.num);

      if (numIndex === -1) {
        // If the number is not present, add it to the array
        user.fav.push(req.body.num);
      } else {
        // If the number is already present, remove it from the array
        user.fav.splice(numIndex, 1);
      }

      // Save the updated document back to the database
      user.save().then((user)=>console.log(user));
      

      res.json({ message: 'Value added to the array.' });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
  
})

app.get("/favn", async(req, res) => {
  const { num, token } = req.query; // Extract query parameters
  console.log(token);
   
  if (token) {
    try {
      const email = jwt.verify(token, "secretkey");

      // Find the user document based on the email
      const user = await users.findOne({ email: email.email });

      if (user) {
        // Check if the number is present in the user's array (e.g., "scores")
        // Replace "42" with the number you want to check
        
        if (user.fav.includes(parseInt(num, 10))) {
          res.json({ message: 'Number is present in the array.' });
          console.log(user);
        } else {
          res.json({error:'no'});
          console.log("no");
        }
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(400);
  }
});

app.get("/favlist",async(req,res) => {
  const { token } = req.query; // Extract query parameters
  console.log(token);
   
  
    try {
      const email = jwt.verify(token, "secretkey");

      // Find the user document based on the email
      const user = await users.findOne({ email: email.email });

      if (user) {
        // Check if the number is present in the user's array (e.g., "scores")
        // Replace "42" with the number you want to check
        try {
          const userPodcastNums = user.fav; // Assuming the user's array is named "scores"
          const pd = await podcasts.find({ num: { $in: userPodcastNums } }).sort({ _id: -1 }).limit(10);
          res.json(pd);
          console.log("pd is shoun");
        } catch (e) {
          res.json({ error: 'true' });
        }
        
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }

})


app.get("/:category",async (req,res) => {
  const name = req.params.category;
  console.log('hi');
  // return res.json({hi:'op'});

  try{
    const pd = await podcasts.find({category:name}).sort({ _id: -1 }).limit(10);
    console.log(pd[0]);
    res.json(pd);
  }catch(e){
    res.json({error:'true'});
  }
    
})
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
