# udacity-cloud-c04 Lesson 3

## Installing Serverless and configuring it
sls and serverless commands do the same thing

`npm install -g serverless`

### In AWS IAM page create account serverless for deploying, save the credentials shown there

### Using the credentials from creating the account add the credentials for serverless profile to ~/.aws/credentials
`sls config credentials --provider aws --key AKIARNAIGHSPA3EAKA54 --secret keyfromIAMpage --profile serverless`

### Creates a template project named 10-udagram-app
`sls create --template aws-nodejs-typescript --path 10-udagram-app`

### Go into the project folder install packages
`npm install`

### deploy to AWS
`sls deploy -v`

### The output contains the endpoints section which only mentions one for GET for this application and has the URL to use for it.
https://0wli2hc2re.execute-api.us-east-1.amazonaws.com/dev/hello
Can execute that command from Postman
In AWS CloudFormation Stacks can see the stack that was created by this

### Install amazon SDK
`npm install aws-sdk --save-dev`

### Allow us to use JSON Schema and perform validation of our incoming requests
`npm install serverless-aws-documentation serverless-reqvalidator-plugin --save-dev`

