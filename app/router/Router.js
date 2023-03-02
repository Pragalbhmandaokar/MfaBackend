const { generateOTP } = require('../utils/opt.utils');

const router = require('express').Router();
const Database = require('../../dbConnection').promise();

router.get('/allUser', async (req, res) => {
  try {
    const [row] = await Database.execute(
      'SELECT `id`,`username` FROM `authentication`'
    );
    res.json(row);
  } catch (error) {
    logger.info(error);
  }
});
router.get('/user/:id', async (req, res) => {
  console.log('called');
  try {
    const [row] = await Database.execute(
      'SELECT * FROM `authentication` WHERE `id`=(?)',
      [req.params.id]
    );
    res.json(row);
  } catch (error) {
    logger.info(error);
  }
});

router.post('/authentication', async (req, res) => {
  try {
    if (req.body.email === undefined) {
      return res.json({ message: 'fields are empty' });
    }

    const [row] = await Database.execute(
      'SELECT * FROM `authentication` WHERE `username`=(?)',
      [req.body.email]
    );

    if (row.length !== 0) {
      return res.json({ message: 'Already exists' });
    }
    const code = generateOTP(6);
    await Database.execute(
      'INSERT INTO `authentication`(`username`,`auth_code`) VALUES(?,?)',
      [req.body.email, code]
    );
    const [user] = await Database.execute(
      'SELECT * FROM `authentication` WHERE `username`=(?)',
      [req.body.email]
    );
    return res.json({ message: 'Successfully Login', user: user[0] });
  } catch (error) {
    logger.info(error);
  }
});

router.post('/passwordAuthentication', async (req, res) => {
  try {
    if (req.body.auth_code === undefined) {
      return res.json({ message: 'fields are empty' });
    }

    const [row] = await Database.execute(
      'SELECT * FROM `authentication` WHERE `auth_code`=(?)',
      [req.body.auth_code]
    );

    if (row.length === 0) {
      return res.json({ message: 'User not found' });
    }
    await Database.execute(
      'UPDATE `authentication` SET `password`=?,`isSecured`=? WHERE `auth_code`= ?',
      [req.body.password, 1, req.body.auth_code]
    );
    return res.json({ message: 'Successfully Login' });
  } catch (error) {
    console.log(error);
    logger.info(error);
  }
});
module.exports = router;
