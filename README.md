Geography-Quiz-php
============================

Author: Navid Kamali
Date Created: 2/9/2011
Description: Geography Quiz Integrated with Google Maps

To see Navid Kamali's Geography Quiz in action, see http://navidkamali.com/geography_quiz/ (php version) and http://geographyquiz.heroku.com/ (RoR version)

If you would like to learn more about me and check out my Rails blog, go to http://ionrails.com

I wrote this initially in php and then rewrote it from scratch in Ruby on Rails.

---------------------------
If you'd like to get your own instance of the php version of the Geography Quiz, please follow these instructions:

1. set up a mysql database for the world database (note the db user, db password and db name)
2. import world.sql into it.
3. modify the dbconnector.php file with your db credentials you've set up.
4. I suggest moving the dbconnector.php file somewhere with no web access if you will be serving the Geography Quiz on a public server.
5. If you do move the dbconmnector.php file, you should reference it's new location in the worldquery.php file.
6. Make sure your web server is running and can process php files and open index.html on your localhost server.

--------------------------
If you'd like to get your own instance of the Ruby on Rails version of the Geography Quiz, please follow these instructions:

1. set up a mysql database for the world database (note the db user, db password and db name)
2. import world.sql into it.
3. modify the DB connection information in the rails projects' database.yml file.
4. rake db:create db:migrate
5. Start your Rails server
6. Open index.html
