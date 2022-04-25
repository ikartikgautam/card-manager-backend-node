scp -i instance.pem ./zip/Archive.zip ubuntu@ec2-3-110-188-217.ap-south-1.compute.amazonaws.com:/home/ubuntu/Archive.zip

ssh -i "instance.pem" ubuntu@ec2-3-110-188-217.ap-south-1.compute.amazonaws.com

ssh -i "/Users/kartikgautam/Dev/prsnl/minor-project/instance.pem" ubuntu@ec2-3-110-188-217.ap-south-1.compute.amazonaws.com

# '/get-Users-select'

- Request Type: get
- This request is used to fetch all Users in DB

# '/get-Users-select-where/:User_Email'

- Request Type: get
- This request is used to fetch details about a particular user

# '/post-Users-insert'

- Request Type: post
- This request is used to insert a new user in DB

# '/delete-Users-delete/:User_Id'

- Request Type: delete
- This request is used to delete a particular user from DB

# '/get-Cards-select'

- Request Type: get
- This request is used to fetch details about all cards in DB

# '/get-Cards-select-where/:Card_UserId'

- Request Type: get
- This request is used to fetch details about cards uploaded by a particular user

# '/get-Cards-insert'

- Request Type: post
- This request is used to insert a new card in DB

# '/delete-Cards-delete/:Card_Id'

- Request Type: delete
- This request is used to delete an already uploaded card from DB

# '/get-Cards-select-like'

- Request Type: get
- This request is used to search for a particular card in DB

# '/getFiles3Link'

- Request Type: get
- This request is used to generate a unique signed url for file in s3

# '/checkExistanceAndGetS3Link'

- Request Type: get
- This request is used to generate a unique signed url of s3 file link

# '/getFileUploadLink'

- Request Type: get
- This request is
