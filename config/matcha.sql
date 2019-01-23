CREATE DATABASE IF NOT EXISTS matcha DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE matcha;

CREATE TABLE users (
  id INT NOT NULL,
  login VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	genre ENUM('Man', 'Woman', 'Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	first_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	last_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
 	created_at datetime NOT NULL,
	mail VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
 	password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	birthdate DATE default NULL,
	phone VARCHAR(22) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	activity VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	bio VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  admin INT(1),
	token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	profimg VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'defaultm.png',
  `googleId` VARCHAR(255) NULL DEFAULT NULL,
  discoDate DATETIME default NULL
);

INSERT INTO `users` VALUES
(1, 'test', 'Man', 'user', 'Normal', '2018-07-17 13:51:34', 'wurerupuk@shinnemo.com', 
'869027f4a0e15006e431c22b00c5d8497d943eada1c87a49ac24f8481315f67531cc59f18b57935eb7a259594f5c3cec142b275dc6d3d54e0f409a83ae59dbb5',
'1990-12-12', '0680808080', 'Student', '', 1, 'VERIF', 'defaultm.png', null, '2018-07-17 13:51:34');

CREATE TABLE `profil_user` (
	`id` INT NOT NULL,
	`uid` INT NOT NULL,
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `popu` INT NOT NULL DEFAULT 0,
  `location` varchar(255) DEFAULT NULL,
  `orientation` ENUM('hétéro', 'bi','homo') DEFAULT 'bi',
  `comp` INT(11) NOT NULL DEFAULT '0',
  `complete` VARCHAR(255) NULL
);

INSERT INTO `profil_user` VALUES
(1, 1, null, 0, null, 'hétéro', '0', null);

CREATE TABLE `matchs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `idMe` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `state` int(11) NOT NULL,
  `room` VARCHAR(255) NULL DEFAULT NULL,
  `date` DATE default NULL
);

CREATE TABLE `param_search` (
	`id` INT NOT NULL,
	`uid` INT NOT NULL,
	`ageMin` INT NOT NULL,
	`ageMax` INT NOT NULL,
	`popu` INT NOT NULL,
	`location` INT NOT NULL,
	`tags` VARCHAR(255) NULL
);

INSERT INTO `param_search` VALUES
(1, 1, 18, 30, 0, 1, '[]');

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `idTag` varchar(255) NOT NULL,
  `text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);

INSERT INTO `tags` (`id`, `idTag`, `text`) VALUES
(1, 'automobile', 'Automobile'),
(2, 'cinema', 'Cinéma'),
(3, 'motos', 'Motos'),
(4, 'nature', 'Nature'),
(5, 'photographie', 'Photographie'),
(6, 'romans', 'Romans'),
(7, 'sport', 'Sport'),
(8, 'Vegan', 'Vegan'),
(9, 'voyage', 'Voyage');

CREATE TABLE `image_user` (
	`id` INT NOT NULL,
	`uid` INT NOT NULL,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `notifs` (
  `id` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `liked` int(11) NOT NULL,
  `visit` int(11) NOT NULL,
  `message` int(11) NOT NULL,
  `matched` int(11) NOT NULL,
  `matchNot` int(11) NOT NULL
);

INSERT INTO `notifs` VALUES
(1, 1, 0, 0, 0, 0, 0);

ALTER TABLE `notifs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uid` (`uid`);

CREATE TABLE `conversations` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `room` VARCHAR(255) NOT NULL,
  `emitter` int(11) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `state` ENUM('1', '0') NOT NULL
);

CREATE TABLE `profil_visit` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `visited` int(11) NOT NULL,
  `visitor` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `last` DATETIME NOT NULL
);

ALTER TABLE `image_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uidimg` (`uid`);

ALTER TABLE `param_search`
  ADD PRIMARY KEY (`id`),
	ADD KEY `uid` (`uid`);

ALTER TABLE `profil_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uid` (`uid`);

ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ADD PRIMARY KEY (`id`);

ALTER TABLE `image_user`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `param_search`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `profil_user`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tags`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `users`
  -- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notifs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `image_user`
  ADD CONSTRAINT `uidimg` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `param_search`
  ADD CONSTRAINT `uidParam` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profil_user`
  ADD CONSTRAINT `uidProfUser` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notifs`
  ADD CONSTRAINT `uidNotifs` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profil_visit`
  ADD CONSTRAINT `uidvisitor` FOREIGN KEY (`visitor`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profil_visit`
  ADD CONSTRAINT `uidvisited` FOREIGN KEY (`visited`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `conversations`
  ADD CONSTRAINT `convid` FOREIGN KEY (`emitter`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `matchs`
  ADD CONSTRAINT `umatch` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `matchs`
  ADD CONSTRAINT `imatch` FOREIGN KEY (`idMe`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
