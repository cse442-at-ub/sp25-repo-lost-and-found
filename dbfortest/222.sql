-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 21, 2025 at 10:04 PM
-- Server version: 8.0.39-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cse442_2025_spring_team_s_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `message_id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `to_user_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`message_id`, `conversation_id`, `user_id`, `to_user_id`, `message`, `created_at`, `is_deleted`) VALUES
(1, 4, 25, 13, 'hello', '2025-04-19 23:30:12', 0),
(2, 4, 25, 13, 'hello admin', '2025-04-19 23:33:31', 0),
(3, 4, 25, 13, 'hello admin', '2025-04-19 23:33:34', 0),
(4, 4, 25, 13, 'hello admin', '2025-04-20 00:09:14', 0),
(5, 4, 25, 13, 'how are you', '2025-04-20 00:09:24', 0),
(6, 4, 18, 18, 'hello , david', '2025-04-20 00:22:18', 0),
(7, 4, 25, 13, 'what\'s up', '2025-04-20 00:38:16', 0),
(9, 7, 18, NULL, 'hello,david, how may i help you?', '2025-04-20 16:45:57', 0),
(10, 7, 25, NULL, 'I have a problem', '2025-04-20 16:46:25', 0),
(11, 7, 18, NULL, 'what kind problem?', '2025-04-20 16:47:10', 0),
(20, 3, 25, NULL, 'hello, I need my phone', '2025-04-20 17:25:46', 0),
(21, 3, 18, NULL, 'ok, tell me more', '2025-04-20 17:25:56', 0),
(23, 7, 25, NULL, 'hello', '2025-04-20 18:42:17', 0),
(24, 5, 25, NULL, 'hello admin', '2025-04-20 19:09:08', 0),
(26, 5, 18, NULL, 'hello david', '2025-04-20 23:44:39', 0),
(29, 8, 18, NULL, 'Hello David, How may I help you?', '2025-04-21 11:59:22', 0);

-- --------------------------------------------------------

--
-- Table structure for table `claims`
--

CREATE TABLE `claims` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `claim_type` enum('lost','found') NOT NULL,
  `proof_of_ownership` text NOT NULL,
  `additional_details` text,
  `approved` tinyint(1) DEFAULT NULL,
  `rejection_reason` text COMMENT 'Reason why a claim was rejected',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `claims`
--

INSERT INTO `claims` (`id`, `user_id`, `item_id`, `claim_type`, `proof_of_ownership`, `additional_details`, `approved`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 9, 13, 'found', '20 dollar bill inside', '', 1, NULL, '2025-04-03 01:36:52', '2025-04-03 01:55:47'),
(3, 14, 12, 'found', 'Has 3 books inside', '', 1, NULL, '2025-04-03 01:52:41', '2025-04-03 01:59:50'),
(4, 9, 14, 'found', 'crack on front of screen ', '', 1, NULL, '2025-04-03 02:08:40', '2025-04-03 02:08:55'),
(10, 26, 19, 'found', 'has my j.b.white sign on the back', '', 1, NULL, '2025-04-04 01:35:34', '2025-04-04 02:19:52'),
(13, 18, 34, 'found', 'Has the initial S.H engraved inside frame', '', 1, NULL, '2025-04-04 21:14:48', '2025-04-18 04:24:39'),
(14, 8, 34, 'found', 'Has the initial S.H engraved inside', '', NULL, NULL, '2025-04-04 21:15:33', NULL),
(15, 8, 33, 'found', 'Has a crack on the rim', '', NULL, NULL, '2025-04-04 21:15:51', NULL),
(18, 8, 21, 'found', 'My boooook', '', NULL, NULL, '2025-04-05 00:18:41', NULL),
(19, 29, 37, 'found', 'It\'s totally my coat', '', NULL, NULL, '2025-04-06 15:32:26', NULL),
(20, 18, 38, 'found', 'Has a bald spot', '', NULL, NULL, '2025-04-07 20:07:55', NULL),
(21, 25, 34, 'found', 'this is minethis is mine', '', NULL, NULL, '2025-04-10 11:48:53', NULL),
(22, 27, 18, 'found', 'this is my donut', '', 1, NULL, '2025-04-21 16:49:30', '2025-04-21 16:51:24'),
(23, 18, 17, 'found', 'asdfasdfasdf', 'asdf', 1, NULL, '2025-04-21 20:14:29', '2025-04-21 20:14:43'),
(24, 18, 44, 'found', 'asdfasdfasdf', '', NULL, NULL, '2025-04-21 22:50:53', NULL),
(25, 18, 46, 'found', 'asdfasdfasdf', '', 1, NULL, '2025-04-21 22:51:46', '2025-04-21 23:12:26'),
(26, 18, 48, 'found', 'asdfasdfasdf', '', NULL, NULL, '2025-04-22 01:03:59', NULL),
(27, 18, 47, 'found', 'asdfasdfasdf', '', 0, NULL, '2025-04-22 01:42:59', '2025-04-22 02:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL,
  `item_id` int NOT NULL,
  `item_type` enum('found','lost') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'open'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`conversation_id`, `item_id`, `item_type`, `created_at`, `last_read_at`, `status`) VALUES
(1, 38, 'found', '2025-04-19 22:08:16', NULL, 'open'),
(2, 24, 'found', '2025-04-19 22:14:02', NULL, 'closed'),
(3, 41, 'found', '2025-04-19 22:18:14', NULL, 'closed'),
(4, 42, 'found', '2025-04-19 22:40:05', '2025-04-20 00:48:17', 'closed'),
(5, 34, 'found', '2025-04-19 23:34:20', '2025-04-20 00:09:40', 'open'),
(6, 40, 'found', '2025-04-20 00:21:42', '2025-04-20 00:21:42', 'open'),
(7, 43, 'found', '2025-04-20 14:33:49', NULL, 'closed'),
(8, 39, 'found', '2025-04-21 03:14:30', NULL, 'closed'),
(9, 18, 'found', '2025-04-21 16:40:40', NULL, 'open'),
(10, 23, 'found', '2025-04-21 20:13:01', NULL, 'open'),
(11, 15, 'found', '2025-04-21 20:14:04', NULL, 'open'),
(12, 22, 'found', '2025-04-21 20:14:11', NULL, 'open'),
(13, 17, 'found', '2025-04-21 20:14:23', NULL, 'open'),
(14, 44, 'found', '2025-04-21 22:50:48', NULL, 'open'),
(15, 46, 'found', '2025-04-21 22:51:42', NULL, 'open'),
(16, 48, 'found', '2025-04-22 01:03:54', NULL, 'open'),
(17, 47, 'found', '2025-04-22 01:42:55', NULL, 'open');

-- --------------------------------------------------------

--
-- Table structure for table `found_items`
--

CREATE TABLE `found_items` (
  `id` int NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `date_found` date NOT NULL,
  `location_found` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `found_items`
--

INSERT INTO `found_items` (`id`, `item_name`, `category`, `date_found`, `location_found`, `description`, `first_name`, `last_name`, `email`, `phone`, `image`, `created_at`, `user_id`) VALUES
(9, 'Mouse', 'Electronics', '2025-03-29', 'Silverman Library 2nd Floor', 'Its a logitech wireless mouse, black color and with a sticker at the back', 'Dinal', 'Dholiya', 'dinalben@buffalo.edu', '9173484579', 'uploads/1743262191_IMG_7777.jpeg', '2025-03-29 15:29:51', 0),
(10, 'Mouse', 'Electronics', '2025-03-28', 'Silevrman Library', 'Black and Logitech', 'Dinal', 'Dholiya', 'dinalben@buffalo.edu', '9173484579', 'uploads/1743265762_IMG_7777.png', '2025-03-29 16:29:22', 0),
(12, 'Bag', 'Other', '2025-03-26', 'Knox 110', 'Brown with trinket', 'Founder', 'Ofitem', 'founder@example.com', '3472150552', '', '2025-03-31 15:10:29', 26),
(13, 'Ring', 'jewelry', '2025-03-06', 'cooke Hall', 'white color silver ring', 'Matt', 'Hertz', 'mathertx@gmail.om', '1234567897', 'uploads/1743438218_ring.png', '2025-03-31 16:30:21', 0),
(14, 'dog', 'Other', '2025-04-04', 'cook hall', 'found a little dog', 'susan', 'strong', 'sstrong@gmail.com', '2344568758', 'uploads/1743701737_bob2.JPG', '2025-04-03 17:35:37', 18),
(15, 'Book', 'Books', '2025-03-03', 'Baldy', 'Note book sky blue color', 'Han', 'Pan', 'hanpan@example.com', '3472150558', 'uploads/1743714448_claim-icon.png', '2025-04-03 21:07:28', 8),
(17, 'donut', 'Other', '2025-04-01', 'donut', 'donut', 'donut', 'donut', 'asdf@gmail.com', '7169999999', 'uploads/1743715242_vlcsnap-2024-12-07-12h13m35s359.png', '2025-04-03 21:20:42', 18),
(18, 'asdf', 'Other', '2025-04-02', 'dasdf', 'asdf', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1743715692_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-03 21:28:12', 18),
(19, 'Painting', 'Other', '2025-03-03', 'Capen', 'painting poster', 'Han', 'Pan', 'hanpan@example.com', '3472150558', 'uploads/1743730435_R.jpeg', '2025-04-04 01:33:55', 8),
(22, 'Water', 'Other', '2025-03-03', 'Baldy', 'Note book sky blue color', 'Han', 'Pan', 'hanpan@example.com', '3472150558', '', '2025-04-04 02:18:50', 8),
(23, 'dog', 'Other', '2025-04-03', '', 'tan dog, shiba inu,', 'David', 'Best', 'neryxw@yahoo.com', '3077664982', 'uploads/1743770136_bob1.JPG', '2025-04-04 12:35:36', 25),
(24, 'brown shoes', 'Other', '2025-04-04', 'davis front door', 'muddy shoes man size 12', 'susan', 'strong', 'sstrong@gmail.com', '3453454567', 'uploads/1743772629_Screenshot 2024-04-11 110713.png', '2025-04-04 13:17:09', 25),
(25, 'Wallet notification test 1', 'Wallet/Purse', '2025-04-01', 'Student Union', 'Black leather wallet with ID card inside', 'Founder', 'Ofitem', 'founder@example.com', '3472150552', '', '2025-04-04 21:00:21', 26),
(26, 'Laptop charger notification test 2', 'Electronics', '2025-04-01', 'Library 2nd Floor', 'Dell laptop charger with white cord', 'Founder', 'Ofitem', 'founder@example.com', '3472150552', '', '2025-04-04 21:00:21', 26),
(30, 'AirPods notification test 6', 'Electronics', '2025-04-03', 'Cafe', 'Apple AirPods in white case', 'Founder', 'Ofitem', 'founder@example.com', '3472150552', '', '2025-04-04 21:00:21', 26),
(31, 'Student ID card notification test 7', 'Documents', '2025-04-04', 'Parking Lot', 'UB student ID card', 'Founder', 'Ofitem', 'founder@example.com', '3472150552', '', '2025-04-04 21:00:21', 26),
(38, 'wig', 'Other', '2025-04-04', 'floor', 'a yellow wig', 'admin', 'admin', 'voiceoverair@gmail.com', '4566665555', 'uploads/1743811628_carla bley.JPG', '2025-04-05 00:07:08', 25),
(39, 'Pink Bottle', 'Other', '2025-04-12', 'Music Library', 'long with scratch', 'Dinal', 'Dholiya', 'dinalben@buffalo.edu', '9173484579', '', '2025-04-14 01:43:06', 27),
(40, 'keyboard', 'Electronics', '2025-04-19', 'davis building', 'found a keyboard. black color.', 'admin', 'admin', 'voiceoverair@gmail.com', '1234567890', 'uploads/1745064103_Screenshot 2025-04-14 092553.jpg', '2025-04-19 12:01:43', 18),
(41, 'red sweater with logo', 'Clothing', '2025-04-19', 'davis building', 'I found a sweater with red color', 'admin', 'admin', 'voiceoverair@gmail.com', '1234567890', 'uploads/1745064500_Screenshot 2025-04-19 080747.jpg', '2025-04-19 12:08:20', 18),
(42, 'mnb', 'Electronics', '2005-01-01', '', '', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745265807_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-21 20:03:27', 18),
(43, 'asdf', 'Electronics', '2005-10-01', '', '', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745266410_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-21 20:13:30', 18),
(44, 'phone', 'Electronics', '2025-04-21', 'Davis Hall', 'I found it in front of desk', 'admin', 'admin', 'voiceoverair@gmail.com', '1234567890', 'uploads/1745267499_phone.jpg', '2025-04-21 20:31:39', 25),
(45, 'asdfadf', 'Electronics', '2025-01-01', '', '', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745268135_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-21 20:42:15', 18),
(46, 'donutt', 'Accessories', '2025-01-01', '', '', 'asfd', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745275892_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-21 22:51:32', 18),
(47, 'denieddonut2', 'Electronics', '2025-01-01', '', '', 'asfd', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745283636_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-22 01:00:36', 18),
(48, 'denieddonut3', 'Electronics', '2025-01-01', '', '', 'adf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745283721_vlcsnap-2024-12-07-12h13m04s865.png', '2025-04-22 01:02:01', 18);

-- --------------------------------------------------------

--
-- Table structure for table `lost_items`
--

CREATE TABLE `lost_items` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `date` date DEFAULT NULL,
  `last_seen_location` text NOT NULL,
  `description` text NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `email_address` text NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `user_id` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lost_items`
--

INSERT INTO `lost_items` (`id`, `name`, `date`, `last_seen_location`, `description`, `first_name`, `last_name`, `email_address`, `phone_number`, `file_path`, `user_id`) VALUES
(9, 'asdf', '2025-03-13', 'Capen Hall', 'I lost a apple watch, it was white color and with black base.', 'asdf', 'asdf', 'asdff@gmail.com', '7163929627', 'uploads/1741821116_vlcsnap-2024-12-07-12h13m04s865.png', NULL),
(23, 'Bag', '2025-03-03', 'Knox 110', 'Brown bag with Minion trinket on back', 'Han', 'Pan', 'hanpan@example.com', '3472150558', 'uploads/1744660984_michael-kors-BLACK-Piper-Large-Pebbled-Leather-Shoulder-Bag.jpeg', 8),
(26, 'aaaClasses lost', '2025-04-03', 'Baird Hall', 'I lost my glasses', 'con', 'tact', 'con@gmail.com', '3457658765', 'uploads/1744652789_glasses.jpg', 25),
(27, 'dog', '2025-04-03', 'IT department', 'shiba', 'ner', 'yxw', 'neryxw@yahoo.com', '1232343495', 'uploads/1743701567_bob3.JPG', 25),
(31, 'dog', '2025-03-30', 'cook 121', 'yellow color', 'susan', 'strong', 'sstrong@gmail.com', '3453454567', 'uploads/1743770060_bob1.JPG', 25),
(32, 'shoes', '2025-04-02', 'davis building', 'brown hiking shoes', 'fan', 'tan', 'fantan@gmail.com', '1234567890', 'uploads/1743772528_Screenshot 2024-04-11 110713.png', 25),
(38, 'Yellow dog', '2025-03-29', 'Cook Hall', 'Yellow stuffed dog toy', 'Han', 'Pan', 'hanpan@example.com', '3472150558', '', 8),
(41, 'Dell laptop charger', '2025-03-31', 'Library', 'White Dell laptop charger with round tip', 'Han', 'Pan', 'hanpan@example.com', '3472150558', '', 8),
(42, 'Blue water bottle', '2025-04-01', 'Gym locker room', 'Blue hydroflask with university stickers', 'Han', 'Pan', 'hanpan@example.com', '3472150558', '', 8),
(45, 'hair', '2025-04-01', 'cabin 333', 'I lost my crazy hair.', 'anne', 'jone', 'annejone@gmail.com', '9993388884', 'uploads/1743811565_carla bley.JPG', 25),
(48, 'Bag', '2025-04-07', 'Baldy', 'Green', 'Han', 'Pan', 'hanpan@example.com', '2345678901', 'uploads/1744056846_iphone.jpeg', 8),
(54, 'laptop', '2025-04-24', 'davis building', '', 'fan', 'tan', 'fantan@gmail.com', '1234567890', 'uploads/1745063988_Screenshot 2025-04-11 192013.jpg', 18),
(56, 'keyboard', '2025-04-30', 'Norton Hall', '', 'fan', 'tan', 'fantan@gmail.com', '1234567890', 'uploads/1745064046_Screenshot 2025-04-14 092553.jpg', 18),
(57, 'red sweater', '2025-04-16', 'Norton Hall', 'I lost my red sweater in class 223 at norton hall around 10:30am', 'fan', 'tan', 'fantan@gmail.com', '1234567890', 'uploads/1745064395_Screenshot 2025-04-19 080529.jpg', 18),
(58, 'admin', '2025-04-14', 'Davis Hall', 'I lost my phone', 'admin', 'admin', 'voiceoverair@gmail.com', '1233456789', 'uploads/1745267426_phone.jpg', 25),
(59, 'phone', '2025-04-16', 'main hall', 'I lost my phone', 'admin', 'admin', 'voiceoverair@gmail.com', '1233454567', 'uploads/1745267748_Screenshot 2025-04-09 105537.jpg', 18),
(60, 'mylostdonut', NULL, 'capen', 'my green capen donut', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745281176_vlcsnap-2024-12-07-12h13m04s865.png', 18),
(61, 'denieddonut', '2025-01-01', '', '', 'asdf', 'asdf', 'asdf@gmail.com', '7169999999', 'uploads/1745283604_vlcsnap-2024-12-07-12h13m04s865.png', 18);

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `match_id` int NOT NULL,
  `lost_item_id` int DEFAULT NULL,
  `found_item_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`match_id`, `lost_item_id`, `found_item_id`) VALUES
(10, 23, 12),
(12, 27, 14),
(16, 41, 26),
(18, 48, 38),
(24, 9, 19),
(25, 32, 9),
(26, 9, 9),
(27, 9, 9),
(28, 9, 9),
(29, 56, 40),
(30, 56, 40),
(31, 57, 41);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(50) DEFAULT 'General',
  `status` varchar(20) DEFAULT 'New',
  `priority` varchar(20) DEFAULT 'Medium',
  `admin_notes` text,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `username`, `name`, `email`, `message`, `created_at`, `category`, `status`, `priority`, `admin_notes`, `is_read`) VALUES
(13, 'sdfds', 'sdfdf', 'sdf@gmail.com', 'sdfsdfd', '2025-03-28 16:07:17', 'General', 'New', 'Medium', NULL, 0),
(14, 'sdfds', 'sdfdf', 'sdf@gmail.com', 'sdfsdfd', '2025-03-28 16:07:18', 'General', 'New', 'Medium', NULL, 0),
(15, 'sdfds', 'sdfdf', 'sdf@gmail.com', 'sdfsdfd', '2025-03-28 16:07:19', 'General', 'New', 'Medium', NULL, 0),
(16, 'ss', 'ss', 'sss@aaa.com', 'sdfsdfsd', '2025-03-31 04:14:36', 'General', 'New', 'Medium', NULL, 0),
(19, 'hanpan@example.com', 'nnk', 'fgvbhd@fvsgab.com', 'Just testing view button', '2025-04-17 01:45:11', 'General', 'New', 'Medium', NULL, 1),
(20, 'testing', 'nnk', 'fgvbhd@fvsgab.com', 'Just testing view button', '2025-04-18 16:14:58', 'General', 'New', 'Medium', NULL, 1),
(21, 'voiceoverair@gmail.com', 'nnk', 'fgvbhd@fvsgab.com', 'Just testing view button', '2025-04-18 21:10:30', 'General', 'New', 'Medium', NULL, 1),
(22, 'voiceoverair@gmail.com', 'nnk', 'fgvbhd@fvsgab.com', 'Just testing view button', '2025-04-18 23:11:16', 'General', 'New', 'Medium', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `user_id` int NOT NULL,
  `email_notif` tinyint(1) NOT NULL,
  `sms_notif` tinyint(1) NOT NULL,
  `push_notif` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`user_id`, `email_notif`, `sms_notif`, `push_notif`) VALUES
(1, 0, 0, 0),
(2, 0, 1, 0),
(6, 1, 1, 1),
(7, 1, 1, 1),
(8, 1, 1, 1),
(9, 1, 1, 1),
(10, 1, 1, 1),
(11, 1, 1, 1),
(12, 1, 1, 1),
(13, 1, 1, 1),
(14, 1, 1, 1),
(15, 1, 1, 1),
(16, 1, 1, 1),
(17, 1, 1, 1),
(19, 1, 1, 1),
(20, 1, 1, 1),
(21, 1, 1, 1),
(22, 1, 1, 1),
(23, 1, 1, 1),
(24, 1, 1, 1),
(25, 1, 1, 1),
(26, 1, 1, 1),
(27, 1, 1, 1),
(28, 1, 1, 1),
(29, 1, 1, 1),
(30, 1, 1, 1),
(31, 1, 1, 1),
(32, 1, 1, 1),
(33, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notification_system`
--

CREATE TABLE `notification_system` (
  `id` int NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('success','warning','info','error') NOT NULL DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `details` text,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notification_system`
--

INSERT INTO `notification_system` (`id`, `user_id`, `title`, `message`, `type`, `link`, `details`, `is_read`, `created_at`, `updated_at`) VALUES
(2, 26, 'Match Found for Your Found Item', 'Someone has reported losing a Bag that matches what you found.', 'success', '/found-items?id=12', 'Good news! We\'ve identified the potential owner of the Bag you found. Thank you for your help!', 1, '2025-03-31 15:21:30', '2025-03-31 15:21:44'),
(4, 26, 'Match Found for Your Found Item', 'Someone has reported losing a Bag that matches what you found.', 'success', '/found-items?id=12', 'Good news! We\'ve identified the potential owner of the Bag you found. Thank you for your help!', 1, '2025-03-31 15:22:01', '2025-04-04 21:24:56'),
(5, 25, 'Claim Submitted', 'Your claim for the Mouse has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 5) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-03 16:54:24', '2025-04-03 16:54:24'),
(6, 13, 'New claim for Mouse', 'A claim (ID: 5) from user (25) has been received. Please review it.', 'info', NULL, 'A claim (ID: 5) from user (25) has been received. Please review it.', 0, '2025-04-03 16:54:24', '2025-04-03 16:54:24'),
(7, 18, 'New claim for Mouse', 'A claim (ID: 5) from user (25) has been received. Please review it.', 'info', NULL, 'A claim (ID: 5) from user (25) has been received. Please review it.', 1, '2025-04-03 16:54:24', '2025-04-03 18:00:36'),
(9, 13, 'New claim for Mouse', 'A claim (ID: 6) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 6) from user (18) has been received. Please review it.', 0, '2025-04-03 16:55:56', '2025-04-03 16:55:56'),
(11, 25, 'Claim Submitted', 'Your claim for the testing has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 7) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-03 16:56:37', '2025-04-03 16:56:37'),
(12, 13, 'New claim for testing', 'A claim (ID: 7) from user (25) has been received. Please review it.', 'info', NULL, 'A claim (ID: 7) from user (25) has been received. Please review it.', 0, '2025-04-03 16:56:37', '2025-04-03 16:56:37'),
(14, 25, 'Item Match Found', 'A dog matching your lost item description has been found.', 'success', '/claim?item=27', 'Good news! We\'ve found an item that matches your lost dog. Please visit the claim page to verify and claim your item.', 0, '2025-04-03 17:36:01', '2025-04-03 17:36:01'),
(15, 18, 'Match Found for Your Found Item', 'Someone has reported losing a dog that matches what you found.', 'success', '/found-items?id=14', 'Good news! We\'ve identified the potential owner of the dog you found. Thank you for your help!', 1, '2025-04-03 17:36:01', '2025-04-03 18:01:18'),
(19, 18, 'Claim Submitted', 'Your claim for the Mouse has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 8) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-03 21:02:17', '2025-04-03 21:02:17'),
(20, 13, 'New claim for Mouse', 'A claim (ID: 8) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 8) from user (18) has been received. Please review it.', 0, '2025-04-03 21:02:17', '2025-04-03 21:02:17'),
(21, 18, 'New claim for Mouse', 'A claim (ID: 8) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 8) from user (18) has been received. Please review it.', 0, '2025-04-03 21:02:17', '2025-04-03 21:02:17'),
(22, 18, 'Claim Submitted', 'Your claim for the donut has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 9) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-03 21:20:52', '2025-04-03 21:20:52'),
(23, 13, 'New claim for donut', 'A claim (ID: 9) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 9) from user (18) has been received. Please review it.', 0, '2025-04-03 21:20:52', '2025-04-03 21:20:52'),
(24, 18, 'New claim for donut', 'A claim (ID: 9) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 9) from user (18) has been received. Please review it.', 0, '2025-04-03 21:20:52', '2025-04-03 21:20:52'),
(25, 26, 'Claim Submitted', 'Your claim for the Painting has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 10) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-04 01:35:34', '2025-04-04 01:35:34'),
(26, 13, 'New claim for Painting', 'A claim (ID: 10) from user (26) has been received. Please review it.', 'info', NULL, 'A claim (ID: 10) from user (26) has been received. Please review it.', 0, '2025-04-04 01:35:34', '2025-04-04 01:35:34'),
(27, 18, 'New claim for Painting', 'A claim (ID: 10) from user (26) has been received. Please review it.', 'info', NULL, 'A claim (ID: 10) from user (26) has been received. Please review it.', 0, '2025-04-04 01:35:34', '2025-04-04 01:35:34'),
(30, 13, 'New claim for Water', 'A claim (ID: 11) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 11) from user (8) has been received. Please review it.', 0, '2025-04-04 02:19:03', '2025-04-04 02:19:03'),
(31, 18, 'New claim for Water', 'A claim (ID: 11) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 11) from user (8) has been received. Please review it.', 1, '2025-04-04 02:19:03', '2025-04-04 02:19:36'),
(33, 26, 'Claim Approved', 'Your claim for the Painting has been approved!', 'success', '/claim-details?id=10', 'Congratulations! Your claim has been approved. Please visit our office to retrieve your item. Remember to bring your ID and reference your claim ID #10.', 0, '2025-04-04 02:19:52', '2025-04-04 02:19:52'),
(35, 27, 'Claim Submitted', 'Your claim for the brown shoes has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 12) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 1, '2025-04-04 20:35:22', '2025-04-08 01:26:27'),
(36, 13, 'New claim for brown shoes', 'A claim (ID: 12) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 12) from user (27) has been received. Please review it.', 0, '2025-04-04 20:35:22', '2025-04-04 20:35:22'),
(37, 18, 'New claim for brown shoes', 'A claim (ID: 12) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 12) from user (27) has been received. Please review it.', 0, '2025-04-04 20:35:22', '2025-04-04 20:35:22'),
(38, 18, 'Claim Submitted', 'Your claim for the Glasses notification test 10 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 13) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-04 21:14:48', '2025-04-04 21:14:48'),
(39, 13, 'New claim for Glasses notification test 10', 'A claim (ID: 13) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 13) from user (18) has been received. Please review it.', 0, '2025-04-04 21:14:48', '2025-04-04 21:14:48'),
(40, 18, 'New claim for Glasses notification test 10', 'A claim (ID: 13) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 13) from user (18) has been received. Please review it.', 0, '2025-04-04 21:14:48', '2025-04-04 21:14:48'),
(41, 8, 'Claim Submitted', 'Your claim for the Glasses notification test 10 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 14) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-04 21:15:33', '2025-04-04 21:15:33'),
(42, 13, 'New claim for Glasses notification test 10', 'A claim (ID: 14) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 14) from user (8) has been received. Please review it.', 0, '2025-04-04 21:15:33', '2025-04-04 21:15:33'),
(43, 18, 'New claim for Glasses notification test 10', 'A claim (ID: 14) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 14) from user (8) has been received. Please review it.', 0, '2025-04-04 21:15:33', '2025-04-04 21:15:33'),
(44, 8, 'Claim Submitted', 'Your claim for the Ring notification test 9 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 15) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 1, '2025-04-04 21:15:51', '2025-04-05 03:08:38'),
(45, 13, 'New claim for Ring notification test 9', 'A claim (ID: 15) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 15) from user (8) has been received. Please review it.', 0, '2025-04-04 21:15:51', '2025-04-04 21:15:51'),
(46, 18, 'New claim for Ring notification test 9', 'A claim (ID: 15) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 15) from user (8) has been received. Please review it.', 0, '2025-04-04 21:15:51', '2025-04-04 21:15:51'),
(47, 8, 'Claim Submitted', 'Your claim for the Student ID card notification test 7 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 16) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-04 21:18:19', '2025-04-04 21:18:19'),
(48, 13, 'New claim for Student ID card notification test 7', 'A claim (ID: 16) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 16) from user (8) has been received. Please review it.', 0, '2025-04-04 21:18:19', '2025-04-04 21:18:19'),
(49, 18, 'New claim for Student ID card notification test 7', 'A claim (ID: 16) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 16) from user (8) has been received. Please review it.', 0, '2025-04-04 21:18:19', '2025-04-04 21:18:19'),
(52, 26, 'Match Found for Your Found Item', 'Someone has reported losing a Laptop charger notification test 2 that matches what you found.', 'success', '/found-items?id=26', 'Good news! We\'ve identified the potential owner of the Laptop charger notification test 2 you found. Thank you for your help!', 0, '2025-04-04 21:59:16', '2025-04-04 21:59:16'),
(54, 26, 'Match Found for Your Found Item', 'Someone has reported losing a Laptop charger notification test 2 that matches what you found.', 'success', '/found-items?id=26', 'Good news! We\'ve identified the potential owner of the Laptop charger notification test 2 you found. Thank you for your help!', 0, '2025-04-04 21:59:22', '2025-04-04 21:59:22'),
(55, 27, 'Claim Submitted', 'Your claim for the dog has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 17) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 1, '2025-04-04 22:04:49', '2025-04-08 01:26:27'),
(56, 13, 'New claim for dog', 'A claim (ID: 17) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 17) from user (27) has been received. Please review it.', 0, '2025-04-04 22:04:49', '2025-04-04 22:04:49'),
(57, 18, 'New claim for dog', 'A claim (ID: 17) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 17) from user (27) has been received. Please review it.', 0, '2025-04-04 22:04:49', '2025-04-04 22:04:49'),
(59, 8, 'Claim Submitted', 'Your claim for the Book has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 18) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 1, '2025-04-05 00:18:41', '2025-04-07 20:14:17'),
(60, 13, 'New claim for Book', 'A claim (ID: 18) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 18) from user (8) has been received. Please review it.', 0, '2025-04-05 00:18:41', '2025-04-05 00:18:41'),
(61, 18, 'New claim for Book', 'A claim (ID: 18) from user (8) has been received. Please review it.', 'info', NULL, 'A claim (ID: 18) from user (8) has been received. Please review it.', 0, '2025-04-05 00:18:41', '2025-04-05 00:18:41'),
(62, 29, 'Claim Submitted', 'Your claim for the coat has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 19) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-06 15:32:26', '2025-04-06 15:32:26'),
(63, 13, 'New claim for coat', 'A claim (ID: 19) from user (29) has been received. Please review it.', 'info', NULL, 'A claim (ID: 19) from user (29) has been received. Please review it.', 0, '2025-04-06 15:32:26', '2025-04-06 15:32:26'),
(64, 18, 'New claim for coat', 'A claim (ID: 19) from user (29) has been received. Please review it.', 'info', NULL, 'A claim (ID: 19) from user (29) has been received. Please review it.', 1, '2025-04-06 15:32:26', '2025-04-18 15:01:03'),
(65, 18, 'Claim Submitted', 'Your claim for the wig has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 20) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 1, '2025-04-07 20:07:55', '2025-04-14 16:07:49'),
(66, 13, 'New claim for wig', 'A claim (ID: 20) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 20) from user (18) has been received. Please review it.', 0, '2025-04-07 20:07:55', '2025-04-07 20:07:55'),
(68, 8, 'Account Security Alert', 'Your password was changed successfully.', 'warning', '/settings', 'Your account password was changed. If you did not make this change, please contact support immediately.', 0, '2025-04-07 20:15:46', '2025-04-07 20:15:46'),
(69, 8, 'Item Match Found', 'A Bag matching your lost item description has been found.', 'success', '/claim?item=48', 'Good news! We\'ve found an item that matches your lost Bag. Please visit the claim page to verify and claim your item.', 0, '2025-04-07 20:17:54', '2025-04-07 20:17:54'),
(70, 25, 'Match Found for Your Found Item', 'Someone has reported losing a wig that matches what you found.', 'success', '/found-items?id=38', 'Good news! We\'ve identified the potential owner of the wig you found. Thank you for your help!', 0, '2025-04-07 20:17:54', '2025-04-07 20:17:54'),
(71, 8, 'Item Match Found', 'A Bag matching your lost item description has been found.', 'success', '/claim?item=48', 'Good news! We\'ve found an item that matches your lost Bag. Please visit the claim page to verify and claim your item.', 1, '2025-04-07 20:18:02', '2025-04-14 19:01:38'),
(72, 25, 'Match Found for Your Found Item', 'Someone has reported losing a wig that matches what you found.', 'success', '/found-items?id=38', 'Good news! We\'ve identified the potential owner of the wig you found. Thank you for your help!', 0, '2025-04-07 20:18:02', '2025-04-07 20:18:02'),
(73, 25, 'Claim Submitted', 'Your claim for the Glasses notification test 10 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 21) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-10 11:48:53', '2025-04-10 11:48:53'),
(74, 13, 'New claim for Glasses notification test 10', 'A claim (ID: 21) from user (25) has been received. Please review it.', 'info', NULL, 'A claim (ID: 21) from user (25) has been received. Please review it.', 0, '2025-04-10 11:48:53', '2025-04-10 11:48:53'),
(77, 27, 'Match Found for Your Found Item', 'Someone has reported losing a Pink Bottle that matches what you found.', 'success', '/found-items?id=39', 'Good news! We\'ve identified the potential owner of the Pink Bottle you found. Thank you for your help!', 1, '2025-04-14 01:44:24', '2025-04-14 01:44:41'),
(78, 27, 'Item Match Found', 'A pink bottle matching your lost item description has been found.', 'success', NULL, '/claim?item=51', 1, '2025-04-14 01:46:06', '2025-04-14 01:46:20'),
(79, 25, 'Match Found for Your Found Item', 'Someone has reported losing a wig that matches what you found.', 'success', '/found-items?id=38', 'Good news! We\'ve identified the potential owner of the wig you found. Thank you for your help!', 0, '2025-04-14 01:46:06', '2025-04-14 01:46:06'),
(80, 27, 'Item Match Found', 'A bag matching your lost item description has been found.', 'success', NULL, '/claim?item=53', 1, '2025-04-14 03:42:16', '2025-04-14 13:32:44'),
(81, 25, 'Match Found for Your Found Item', 'Someone has reported losing a wig that matches what you found.', 'success', '/found-items?id=38', 'Good news! We\'ve identified the potential owner of the wig you found. Thank you for your help!', 0, '2025-04-14 03:42:16', '2025-04-14 03:42:16'),
(82, 27, 'Item Match Found', 'A bag matching your lost item description has been found.', 'success', NULL, '/claim?item=52', 1, '2025-04-14 13:36:16', '2025-04-14 13:36:28'),
(83, 25, 'Match Found for Your Found Item', 'Someone has reported losing a wig that matches what you found.', 'success', '/found-items?id=38', 'Good news! We\'ve identified the potential owner of the wig you found. Thank you for your help!', 0, '2025-04-14 13:36:16', '2025-04-14 13:36:16'),
(84, 18, 'Claim Approved', 'Your claim for the Item has been approved!', 'success', '/retrieve-form', 'Congratulations! Your claim has been approved. Please submit the retrieval form to claim your item. Remember to bring your ID and reference your claim ID #13 when you come to pick it up.', 1, '2025-04-18 04:24:39', '2025-04-18 15:00:56'),
(85, 8, 'Match Found for Your Found Item', 'Someone has reported losing a Painting that matches what you found.', 'success', '/found-items?id=19', 'Good news! We\'ve identified the potential owner of the Painting you found. Thank you for your help!', 0, '2025-04-18 04:25:02', '2025-04-18 04:25:02'),
(86, 25, 'Item Match Found', 'A shoes matching your lost item description has been found.', 'success', '/retrieve-form', 'Good news! We\'ve found an item that matches your lost shoes. Please visit the claim page to verify and claim your item. Please submit the retrieval form to verify and claim your item.', 0, '2025-04-18 05:00:51', '2025-04-18 05:00:51'),
(91, 18, 'Item Match Found', 'A keyboard matching your lost item description has been found.', 'success', '/retrieve-form', 'Good news! We\'ve found an item that matches your lost keyboard. Please visit the claim page to verify and claim your item. Please submit the retrieval form to verify and claim your item.', 0, '2025-04-19 12:02:23', '2025-04-19 12:02:23'),
(92, 18, 'Match Found for Your Found Item', 'Someone has reported losing a keyboard that matches what you found.', 'success', '/found-items?id=40', 'Good news! We\'ve identified the potential owner of the keyboard you found. Thank you for your help!', 0, '2025-04-19 12:02:23', '2025-04-19 12:02:23'),
(93, 18, 'Item Match Found', 'A keyboard matching your lost item description has been found.', 'success', '/retrieve-form', 'Good news! We\'ve found an item that matches your lost keyboard. Please visit the claim page to verify and claim your item. Please submit the retrieval form to verify and claim your item.', 0, '2025-04-19 12:02:31', '2025-04-19 12:02:31'),
(94, 18, 'Match Found for Your Found Item', 'Someone has reported losing a keyboard that matches what you found.', 'success', '/found-items?id=40', 'Good news! We\'ve identified the potential owner of the keyboard you found. Thank you for your help!', 0, '2025-04-19 12:02:31', '2025-04-19 12:02:31'),
(95, 18, 'Item Match Found', 'A red sweater matching your lost item description has been found.', 'success', '/retrieve-form', 'Good news! We\'ve found an item that matches your lost red sweater. Please visit the claim page to verify and claim your item. Please submit the retrieval form to verify and claim your item.', 0, '2025-04-19 12:09:14', '2025-04-19 12:09:14'),
(96, 18, 'Match Found for Your Found Item', 'Someone has reported losing a red sweater with logo that matches what you found.', 'success', '/found-items?id=41', 'Good news! We\'ve identified the potential owner of the red sweater with logo you found. Thank you for your help!', 0, '2025-04-19 12:09:14', '2025-04-19 12:09:14'),
(97, 27, 'Claim Submitted', 'Your claim for the asdf has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 22) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-21 16:49:30', '2025-04-21 16:49:30'),
(98, 13, 'New claim for asdf', 'A claim (ID: 22) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 22) from user (27) has been received. Please review it.', 0, '2025-04-21 16:49:30', '2025-04-21 16:49:30'),
(99, 18, 'New claim for asdf', 'A claim (ID: 22) from user (27) has been received. Please review it.', 'info', NULL, 'A claim (ID: 22) from user (27) has been received. Please review it.', 0, '2025-04-21 16:49:30', '2025-04-21 16:49:30'),
(100, 27, 'Claim Approved', 'Your claim for the asdf has been approved!', 'success', '/retrieve-form', 'Congratulations! Your claim has been approved. Please submit the retrieval form to claim your item. Remember to bring your ID and reference your claim ID #22 when you come to pick it up.', 1, '2025-04-21 16:51:24', '2025-04-21 16:56:49'),
(101, 18, 'Claim Submitted', 'Your claim for the donut has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 23) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-21 20:14:29', '2025-04-21 20:14:29'),
(102, 13, 'New claim for donut', 'A claim (ID: 23) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 23) from user (18) has been received. Please review it.', 0, '2025-04-21 20:14:29', '2025-04-21 20:14:29'),
(103, 18, 'New claim for donut', 'A claim (ID: 23) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 23) from user (18) has been received. Please review it.', 0, '2025-04-21 20:14:29', '2025-04-21 20:14:29'),
(104, 18, 'Claim Approved', 'Your claim for the donut has been approved!', 'success', '/retrieve-form', 'Congratulations! Your claim has been approved. Please submit the retrieval form to claim your item. Remember to bring your ID and reference your claim ID #23 when you come to pick it up.', 0, '2025-04-21 20:14:43', '2025-04-21 20:14:43'),
(105, 18, 'Claim Submitted', 'Your claim for the phone has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 24) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-21 22:50:53', '2025-04-21 22:50:53'),
(106, 13, 'New claim for phone', 'A claim (ID: 24) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 24) from user (18) has been received. Please review it.', 0, '2025-04-21 22:50:53', '2025-04-21 22:50:53'),
(107, 18, 'New claim for phone', 'A claim (ID: 24) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 24) from user (18) has been received. Please review it.', 0, '2025-04-21 22:50:53', '2025-04-21 22:50:53'),
(108, 18, 'Claim Submitted', 'Your claim for the donutt has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 25) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-21 22:51:46', '2025-04-21 22:51:46'),
(109, 13, 'New claim for donutt', 'A claim (ID: 25) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 25) from user (18) has been received. Please review it.', 0, '2025-04-21 22:51:46', '2025-04-21 22:51:46'),
(110, 18, 'New claim for donutt', 'A claim (ID: 25) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 25) from user (18) has been received. Please review it.', 0, '2025-04-21 22:51:46', '2025-04-21 22:51:46'),
(111, 18, 'Claim Approved', 'Your claim for the donutt has been approved!', 'success', '/retrieve-form', 'Congratulations! Your claim has been approved. Please submit the retrieval form to claim your item. Remember to bring your ID and reference your claim ID #25 when you come to pick it up.', 0, '2025-04-21 23:12:26', '2025-04-21 23:12:26'),
(112, 18, 'Claim Submitted', 'Your claim for the denieddonut3 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 26) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-22 01:03:59', '2025-04-22 01:03:59'),
(113, 13, 'New claim for denieddonut3', 'A claim (ID: 26) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 26) from user (18) has been received. Please review it.', 0, '2025-04-22 01:03:59', '2025-04-22 01:03:59'),
(114, 18, 'New claim for denieddonut3', 'A claim (ID: 26) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 26) from user (18) has been received. Please review it.', 0, '2025-04-22 01:03:59', '2025-04-22 01:03:59'),
(115, 18, 'Claim Submitted', 'Your claim for the denieddonut2 has been submitted and is awaiting review.', 'info', NULL, 'Your claim (ID: 27) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.', 0, '2025-04-22 01:42:59', '2025-04-22 01:42:59'),
(116, 13, 'New claim for denieddonut2', 'A claim (ID: 27) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 27) from user (18) has been received. Please review it.', 0, '2025-04-22 01:42:59', '2025-04-22 01:42:59'),
(117, 18, 'New claim for denieddonut2', 'A claim (ID: 27) from user (18) has been received. Please review it.', 'info', NULL, 'A claim (ID: 27) from user (18) has been received. Please review it.', 0, '2025-04-22 01:42:59', '2025-04-22 01:42:59'),
(118, 18, 'Claim Denied', 'Your claim for the denieddonut2 has been denied.', 'warning', '/retrieve-form', 'We\'re sorry, but your claim has been denied. If you believe this is an error, please contact our office.', 0, '2025-04-22 02:01:47', '2025-04-22 02:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `otp_tokens`
--

CREATE TABLE `otp_tokens` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` char(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `otp_tokens`
--

INSERT INTO `otp_tokens` (`id`, `email`, `token`, `created_at`, `used`) VALUES
(1, 'dstrong@gmail.com', '$2y$10$NAqr0Y2P8X0vKzKBX6LeT.loqGxFz0a.5BDI8TdJI4SFHx4lFB42K', '2025-03-31 04:07:00', 0),
(2, 'neryxw@yahoo.com', '$2y$10$.LbWXqYdEq3FO2MHp02xD..kPv.JyVo/eDKs1GSbw3eloddATB9sm', '2025-03-31 04:07:58', 0),
(3, 'neryxw@yahoo.com', '$2y$10$vr9xHNnUCh98YifoGmKbA.VfoqXNU/vaRAmzPZgz5ETfVUHcbjR/.', '2025-03-31 04:16:55', 0),
(4, 'neryxw@yahoo.com', '$2y$10$eSCOcLgQ/4a9yOqftTdovul07O13I8RjqQV6HA8mHomfOjPNyUILa', '2025-03-31 12:10:56', 0),
(5, 'neryxw@yahoo.com', '$2y$10$4txT3BKoM2AElKu/GFMeC.vks61mdQGnEvMH.lYyD6ez/qksm8IH2', '2025-03-31 19:18:39', 0),
(6, 'neryxw@yahoo.com', '$2y$10$I4pvsXIu6H0v7H3D5kvTJ.TjkigOUofQkiDxaaOa6sxaNwmPIjCvm', '2025-03-31 20:03:15', 0),
(7, 'neryxw@yahoo.com', '$2y$10$SVo7PcIfu59h7l8D4TygIOMMU50zmSLYK/qxfedsPurooMYLXv.xe', '2025-03-31 20:03:16', 0),
(8, 'neryxw@yahoo.com', '$2y$10$ePBMt1mpC1BIsRUzBAXyNOZV3dcJ/y5HvFHmu0NFGxGk3mQ1nsVQO', '2025-04-04 15:41:33', 0),
(9, 'neryxw@yahoo.com', '$2y$10$0JjdHR9ru1l5EmzXjY6wjuAxHxPjEcB3EoP4O87Ca9zneB9JEmI/y', '2025-04-04 15:41:40', 0),
(10, 'blaketur@buffalo.edu', '$2y$10$GKa/gi1HwXyDyEa2s9UM4.MxH2pGcjK3HGDeLeqiBrZb0DNPtzIZO', '2025-04-04 21:20:46', 0),
(11, 'neryxw@yahoo.com', '$2y$10$oRoEFWf34Tv7UDU4yqAitOstqnOaTZeU8uq5Ncu5UWa/OAVkAORyy', '2025-04-07 15:14:31', 0),
(12, 'neryxw@yahoo.com', '$2y$10$eI/cn9pP4Hmuwy0GhqsulOLam.qv1PY65fp2t59u3QYSg00Sen3ym', '2025-04-15 19:03:53', 1),
(13, 'neryxw@yahoo.com', '$2y$10$nZO7rT.i.gTineeuBZ1RQO5OK0Cgv7cf/IHgMvgiVD1WH4lIXze8C', '2025-04-17 01:19:45', 0),
(14, 'blaketur@buffalo.edu', '$2y$10$O5Y6JhLwzgGB/JW7ffv0LucnJYvMJD5hzPvl5xXQC0iMacbMuI8c.', '2025-04-17 15:30:49', 0),
(15, 'neryxw@yahoo.com', '$2y$10$/Sn8.IpiO9h2uMxU7XpdkOBYQqist.eaE2e5Md2MMR.ucaxRxfoU.', '2025-04-18 15:44:38', 0),
(16, 'neryxw@yahoo.com', '$2y$10$uNztBZ5M/Y5AQ0/gVRGE6e3FOoIBNz78OqjRqY67i3Mke9F/XkEcm', '2025-04-18 16:09:58', 1);

-- --------------------------------------------------------

--
-- Table structure for table `retrieve_requests`
--

CREATE TABLE `retrieve_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `found_item_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `delivery_method` varchar(50) DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `additional_instructions` text,
  `address` text,
  `county` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','ready for pickup','sent via mail','') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `retrieve_requests`
--

INSERT INTO `retrieve_requests` (`id`, `user_id`, `found_item_id`, `name`, `email`, `delivery_method`, `preferred_time`, `additional_instructions`, `address`, `county`, `state`, `zipcode`, `pickup_location`, `submitted_at`, `status`) VALUES
(3, 27, 0, 'Dinal Dholiya', 'dinalben@buffalo.edu', 'shipping', NULL, 'test', '36 Affinity Lane', 'New York', 'New York', '14215', '', '2025-04-14 00:35:44', NULL),
(5, 5, 9, 'barbus', 'barbus@example.com', 'mail', '22:45:35', NULL, '999 example road, Buffalo, NY', 'Buffalo', 'NY', '14261', 'n/a', '2025-04-14 02:46:27', 'ready for pickup'),
(7, 18, NULL, 'blake', 'blake@example.com', 'shipping', NULL, '', '4987 Forest road', 'Lewiston', 'NY', '14092', '', '2025-04-14 03:46:38', NULL),
(8, 27, NULL, 'EDwine', 'ed', 'shipping', '00:00:00', 'test-Dinal-9:25-April 14th', 'Sweet home apartments', 'Erie', 'New York', '14215', '', '2025-04-14 13:25:51', NULL),
(9, 8, NULL, 'Shanoya Henry', 'shanoyah@buffalo.edu', 'shipping', '00:00:00', 'test', 'University at Buffalo', 'New York', 'New York', '14260', '', '2025-04-14 20:01:32', NULL),
(10, 18, NULL, 'blake', 'blaketurner2005.contact@gmail.com', 'pickup', '12:00:00', '', '', '', '', '', 'Silverman Library', '2025-04-21 17:00:03', NULL),
(11, 18, NULL, 'nnk', 'hanpan@example.com', 'pickup', '17:10:00', 'test', '', '', '', '', 'Student Union', '2025-04-21 20:10:56', NULL),
(12, 18, NULL, 'nnk', 'hanpan@example.com', 'pickup', '16:20:00', 'testing testing', '', '', '', '', 'Student Union', '2025-04-21 20:22:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` char(64) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `is_admin`, `created_at`, `user_id`) VALUES
('037cc88f6eed367aed33a7fb9d9010893bb29dce78e70024ad3a621a29360995', 1, '2025-04-17 14:21:52', 18),
('0bf13c83a4ed5eec53a8ea789ef76de345deb1859ab0f385804e67b2533dff99', 1, '2025-04-22 00:24:31', 18),
('0c68ce7a5d08be6dde18ef29b8cfbcb5bfc5cd658e53d749ae04daef2d93c2be', 1, '2025-04-21 19:48:19', 18),
('0ea9bdc92aa3bcf73a1e575030f4582f7208d247fbe79ec2f684831901922409', 0, '2025-04-14 20:22:45', 8),
('100f1d27fd2d222a8bc00401d7ccc9a2156c752e8aad5f60f73a79cee93f9909', 1, '2025-04-17 14:03:03', 18),
('112935bb66caa011b9d2669e7d498d69f2a414578715f7b8ac8a1f39ced5221a', 1, '2025-04-17 15:54:46', 18),
('11f2e67de2013c32b195d560e6cfbf11881b5795879c5535f4753611ae741ce6', 1, '2025-04-17 03:02:40', 18),
('122513fe4681550f9f42010d9bbe69e63affd267ddc51cbe579dffaf1b7b6b2b', 0, '2025-04-17 00:59:50', 25),
('12b521136d80a7bd4d06c5b8bb95ac649ff6e2f95f5debaad7843bc05925ed91', 1, '2025-04-18 16:14:38', 18),
('15038d799b9a9134d5c1ac7a211f0a2a1d531eeecdac424af3f399fd3d88c4c9', 1, '2025-04-14 20:19:51', 18),
('15b53439880a65a964e1a79245b6c22f79f283cd1e4000ac2026f680f0a6bce8', 1, '2025-04-17 01:45:16', 18),
('180591ded3edccd9e20ec095f295aa718bb4d86bfff7a1cb522ae903081630b7', 1, '2025-04-16 22:30:27', 18),
('1bc46940527c747c2efe5ad098c9afe9ea70737e8a4ed7a9064c86a6360ebbb5', 0, '2025-04-14 17:47:42', 25),
('208991f9fe54fbbea9dde3b3d76d023ee0234c8db4c14474593554706f8dcc60', 1, '2025-04-14 21:12:04', 18),
('21ad6aceabc32a63fe319363e3e1e036f7ecd49de4db9fb7db1dd7f41711278b', 1, '2025-04-16 23:42:11', 18),
('21ad891cd722a4124caa1c678002f817a216b185970e1896c2333b90c2946148', 0, '2025-04-18 15:01:13', 27),
('26218e9835cd6c0beb8e1197be4477593c4420bb587fd701a2ca54a11356c9b0', 0, '2025-04-15 01:44:53', 25),
('2cd6ae80a18773d170a08f7e0f80774c4a87a23699f4dac16f162917c37219af', 0, '2025-04-14 20:18:19', 27),
('327750c7a16bbbed618bdc5aae57fda27ff32c9d8289838f021bd10f987d4acc', 1, '2025-04-22 01:24:33', 18),
('32dfc39fdb6fa1b73dbc027efdfa941850ad5ecfc5d1bb4f7843c8b33d864bfc', 1, '2025-04-22 00:16:24', 18),
('33cc9d940405f221516e74283a7ba345e63f1ea2e6d0b590fe74dbe9dc286c7b', 1, '2025-04-18 16:39:59', 18),
('342e7bb9edf97e290b2625b8f48086d52bf447fbeb93d579d20481043f959d9b', 1, '2025-04-21 01:51:55', 18),
('3ca9d24cab77b18df86b83d1acc6ede2ebe3721e063c960b1b11aa0d2527f68b', 1, '2025-04-16 16:34:17', 18),
('41e9796ac8ab89312e7b63184a6071058ad270045f8d94bada76aab0ad349a74', 1, '2025-04-17 14:32:15', 18),
('46476b85feb414384ec36a3df312d1d0ac671b92eda33663589af4fccceb5ad5', 1, '2025-04-16 22:17:36', 18),
('48a381a68acfb8033229b3255a00dcb8ef69d98ff94708cb59e903caa60f05a5', 1, '2025-04-21 11:01:46', 18),
('52a78262bc44281d440a538ded926106d81e20789042257d1e14fd7d4a6baa0c', 1, '2025-04-17 15:40:10', 18),
('579d9222606c861ec64a6079f411ce30f43dc6aa8f4032408ff78eac588c5c4b', 0, '2025-04-14 19:00:17', 27),
('618d473933cea4c15bf8a559f051756b3b558b0cc56322591506dc05ae835bfe', 1, '2025-04-21 02:29:41', 18),
('63c2617cff9256aaef377c43663baf08a02ed54c56649c9e24712cd9eb7c2878', 0, '2025-04-18 14:11:39', 27),
('6837dbee7101678a2dfb7b811125532762f8bccd9453cc3637dd92e780cfa531', 1, '2025-04-21 23:20:52', 18),
('68d8734eeadae6ccfe8c82bf773e1110a87928383d6c86f588cbe7a101d4ad3f', 0, '2025-04-16 19:18:16', 27),
('6901aade8f72aaa02fe2fd7f88d844e84c95350aae106dea785e3b9f09263e72', 1, '2025-04-18 21:13:04', 18),
('6a8f1bae18d9ebbfef33805f372f4259189575932ac8d75d8d02405bb71c0768', 0, '2025-04-14 19:47:30', 8),
('6afd22259e88ab3d8a6a75876494a78dba70ed18a8f5150fb945957ef1d888b4', 0, '2025-04-14 19:01:32', 8),
('6e14bceaee856965ddbf6a7ca3be6a28fa8968f3b3a0bb79b4fff641dce70264', 0, '2025-04-20 23:25:19', 8),
('701d934af5be2211bc037557d22f763049aa2fae3bed39595a7e46108a78291d', 0, '2025-04-21 17:03:19', 27),
('70634c243c879452fa5c899468601722c34c9985a8bedb1b195d78756284fdce', 1, '2025-04-17 00:01:07', 18),
('7172b024f6dd6918bf27c6835df420968ca23b0dbb9d2ac40da899cc705f94e9', 0, '2025-04-18 14:11:34', 27),
('72524460a8855c7d9f458ab909b5b0d926d948756edeb156dd27171c6e8d3c9d', 0, '2025-04-14 22:28:18', 25),
('74e08d6f21a6c570ea80fe7d2b7c24890f24b7c187318980f14275a8b046ee86', 0, '2025-04-19 11:56:58', 25),
('752371a9e7273b39f95803096ca7a9c066fea7f2eaf6422a984b6ceba3d0da0e', 0, '2025-04-14 14:46:58', 25),
('7613c0b24c7c7348f55b0620ea877c6417bf230464eb267b3c97e29e9fe5d8c0', 0, '2025-04-14 16:29:04', 27),
('76737e64b559fe4794de378ae58210e9caf55678f1c7a733b3184194841c3922', 1, '2025-04-21 14:39:24', 18),
('767a3479eeb8b050bd0ad7877de2e073d66845d1a06345ab93339e6dc83a58ee', 0, '2025-04-14 22:55:29', 25),
('76aa0838440aa5faca66d4cc9c08bdefd7a3f147bfb5f9e8f7d0712dc35d300f', 1, '2025-04-21 02:50:50', 18),
('79239c1c067c450113979226be577ddc61b2484195b75e9844fa4f7c1916ec6f', 1, '2025-04-21 03:26:11', 18),
('7eac70999bdb7da470f2732d9d42a60af32b43f56be118ad780dcf3c814fe30b', 1, '2025-04-17 14:02:27', 18),
('823bfcc86964fc7de664dcb75a2912a881a8b236db48a0d520ac17d6f3e248e8', 1, '2025-04-21 20:46:52', 18),
('837d1801041c806ff12044fa903aedf3d062076b28373526d59b92c6663fe526', 1, '2025-04-17 21:23:57', 18),
('85ed571f46f8771d5f8c51ce20ddafc2b617960dc24c9d735c65d03c352039bc', 0, '2025-04-14 19:26:12', 25),
('866cc3cee66914847d263f76864be7cea043c6117bc339a612fe7d2f9cdd688a', 0, '2025-04-18 21:39:56', 25),
('89663d261b68867628d16c8f5655d3f2f8193f951ffe88449ea2998347619b9c', 0, '2025-04-14 16:12:24', 25),
('8e1161c8fb41adbad18fb7029a1eaab3bef55bb4e950ad25d4683e5c0fccfef2', 1, '2025-04-14 16:08:40', 18),
('8f64b0a2617b9782c3b34fc6f5db36ca7ef04152f562878e7282664643dbf6c8', 0, '2025-04-14 17:47:02', 8),
('94bfe0bbbc374830ab6594bd6d5570120d05693928d54929e5ce5f9922fde8e6', 1, '2025-04-16 17:53:00', 18),
('95ca07545d41ae5f9d7e6d1b60d9cc4f33cc29304207066a2f6991300b819e64', 1, '2025-04-19 13:21:37', 18),
('9937864c3bad661e70338076cb166893aeae06b07c13ef4a1ebda5b51bcb13c7', 1, '2025-04-18 16:20:44', 18),
('9ba0e464b7e6044c00c6d95535ac4a92f1fd780f5b494f261847e6e41b1a23c6', 1, '2025-04-19 13:56:54', 18),
('9d603173aa897e2fe43d131fe52fec10d0dbbd212afbe1a4905a67f4be4432e0', 1, '2025-04-22 02:01:50', 18),
('9d676beedcb33a8c7defb73b2b31213b3a17437be1d71abebf60991e21606892', 0, '2025-04-18 16:12:05', 25),
('9ded315fff1cd635c4e79de1eb9c266d254ed3e716ed314848f67157237a5c26', 1, '2025-04-16 23:44:03', 18),
('a054804d4ddecbea3abbaf495e8048ca3ad9dc3deb73135381b02124a4685869', 0, '2025-04-20 23:48:53', 25),
('a125b64caf8554064fa86bce553626bb0ba7c8ca9cccd4ab28051cd1d0ed5629', 1, '2025-04-21 02:57:46', 18),
('a3c6c659ff35d706aa8f384e67871a1b7b3ff255c4ea956ac327b6c042a189bf', 0, '2025-04-20 23:25:41', 8),
('a6939c0e68c7048392b57a24deade708f468b70d8fd7fb417f4ddfd7c382431c', 1, '2025-04-16 23:41:47', 18),
('adc68483ae8ecf8323a26f81d809962d2c4b9f176bfc520331c45d52ab6d9a94', 0, '2025-04-14 17:17:21', 27),
('afeb6682159acaea243d072f2364706a666ad984184f93702e537441ad47f032', 1, '2025-04-21 20:35:51', 18),
('b2d081c5721b1ac6e6c3304189d45c73089bd167187af3e8609878b62e1e1d38', 1, '2025-04-21 20:22:05', 18),
('b3f839ad9e2f2695a20cbf545944f7eea8e605a4c7a2d5c8fec30ba91ba2f73e', 1, '2025-04-15 01:24:39', 18),
('b402d740b88de20de72d861906f38bd4060b9894e04148045e1631ee61dfed79', 0, '2025-04-21 20:40:17', 8),
('b918e889e9d14fc7fdf57b4091769f87a72c984cc1a17fec5e1bb96eb4a45b80', 1, '2025-04-16 21:13:28', 18),
('bac81af2076d74eca12803b9cbc676f733e66e3b88c43cec331f5de4d1b7057f', 0, '2025-04-14 13:36:25', 27),
('c74bb06314e23812e140fdfac74a96e1e6ec75cf860d60109a6ebd2fd9da01d9', 1, '2025-04-14 19:31:12', 18),
('cab25d89376f26558d6a5ba8453e94280a4eb3d329e05bafbf2d0cc6f1284fa4', 0, '2025-04-17 19:45:37', 25),
('ce1cecf7260ba7be4683467542e8767f595e57995771cfceb34e00f054956afe', 1, '2025-04-16 22:31:54', 18),
('d03ab86fe901643231daba0e81131a36f87e6d5b765bded2c7672f9a49fdb25d', 1, '2025-04-21 17:16:32', 18),
('d53a94545b2ed79e0af23df2549eb0d3511b2e5922529289e62a426b0abc6680', 0, '2025-04-17 20:15:12', 25),
('d547f18edb9b3a4655339ad83e311c499ccc7ad837f5356b3d970b58cf38dbc3', 0, '2025-04-20 23:25:54', 8),
('d7296a868c1372b353b62c4170bf623f2c9e554e99211e5fb16d94d69e5227b4', 0, '2025-04-21 02:46:37', 25),
('d7a7e3217eab687609e7ba2ffd0c2c142c579b1cf0aa8ed28685e07ea1a9e6aa', 1, '2025-04-18 21:34:45', 18),
('da61cf7a8d305098131dfacb55682d9f4f28edd6dbd6e4e43762bbbcb508c676', 1, '2025-04-18 05:04:06', 18),
('e2a2201ff16b9273f4ea651c5c0e76ab80e34df8d160ac75138d6defc4794ccf', 1, '2025-04-21 20:06:45', 18),
('e6616c5d09e2c631e897cac300cb8fd69938cdfef9d6d599a3a03a5e43f42e8b', 0, '2025-04-14 20:39:52', 25),
('e94dbb0993a4138a3952e2715bd599a780d3092ca240bd4cbd19d49532dbdcf3', 1, '2025-04-14 16:53:33', 18),
('eaa1de69cdcd676391d9a328fc435d81e6af971941986a53b87fbdda3924b984', 0, '2025-04-19 11:03:36', 25),
('f9dac1ca65f5582b8066e6e2187735e6e0daab1b82e225bae7052b6d0ebca2e2', 1, '2025-04-19 12:09:20', 18),
('f9fe67f0832f6226fbff934021536f9d2f21593fe40f5c9234fd6a8ce8ae38df', 1, '2025-04-16 23:00:42', 18),
('fe695fa9a1709a86550804ee2ce160b118ca3707e2d3b0d19d4ebacad2e6ff05', 1, '2025-04-18 23:11:54', 18);

-- --------------------------------------------------------

--
-- Table structure for table `sign_up`
--

CREATE TABLE `sign_up` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int UNSIGNED NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` char(60) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `last_active` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `first_name`, `last_name`, `phone_number`, `email`, `password`, `is_deleted`, `is_admin`, `last_active`) VALUES
(5, 'kxcsmg', 'qwerty', 'asdfgh', NULL, 'bcga@gmail.com', '$2y$10$SyCJ9yymbIRzcI7XyFJwfOWfpxtgBSYOwog2SGOz2lpKvJ4JhrI3a', 0, 0, NULL),
(6, 'kxcsmg', 'qwerty', 'asdfgh', NULL, 'bcga1@gmail.com', '$2y$10$fJmjDbH2frScrzFTGEM0lOKc9WS.Zg5Bfu28djVJNjmD.M7J/OuuW', 0, 0, NULL),
(7, 'sahithre', 'sahithre', 'vatti', '(716) 303-9689', 'user123@gmail.com', '$2y$10$2sZMy7JCmjglZIKJVVAih.rpJWYJtOnLblvEfYqpeKXZUPn6oJ3BS', 1, 0, NULL),
(8, 'Panpan', 'Hann', 'Pan', NULL, 'hanpan@example.com', '$2y$10$icpqSI6pJ/hjRunQ9E0DDOSXXd6YBdLKlVAESzODqzSpfq0Sd2T16', 0, 0, NULL),
(11, 'sahithre', 'sahith', 'vatti', NULL, 'sahithreddy030@gmail.com', '$2y$10$akmP.Bs9pb0/8ygi1GQElOf8y2DSpFFWPDG1XXys04LjXvWqHd9eC', 0, 0, NULL),
(13, 'Panpan', 'Han', 'Pan', NULL, 'hanpan1@example.com', '$2y$10$MuhdKfE1SUkIhXr356mti.wKl7.9U00jHWhTn10FqYcIg4eQXYiuO', 0, 1, NULL),
(18, '', 'ADMIN', 'CSE442S', NULL, 'voiceoverair@gmail.com', '$2y$10$mASLj7pFoxr7OoLq4Q.8ReX3XwiZw3cznd3V3WBvHJL6lrIOIajPW', 0, 1, NULL),
(21, 'fff', 'ddd', 'fff', NULL, 'yamaddison@gmail.com', '$2y$10$Ue2CZWUUfoyWB0OdfRul2OdREZcHUM4/TVqPC94rqSwvB0ZBUw6qW', 0, 0, NULL),
(22, 'sss', 'sss', 'sss', NULL, '123@whatever.com', '$2y$10$UD2T5X0SXBpZ4rr7WffPee2n297LvJTtdKh4/8aQpQeJFFIEgn20O', 0, 0, NULL),
(23, 'Nav', 'Na', 'krish', NULL, 'navaneethkrishna23@gmail.com', '$2y$10$pXJtY4X1458.HW7UelfTeOE.ETEmQsBgInOksXH4oNlwmlsfZeoda', 0, 0, NULL),
(24, 'sss', 'sss', 'sss', NULL, 'sss@gmail.com', '$2y$10$cc/hFrMDS7A6PrSbGldFaewZMAgOuLQskF1jZ.Gpfv3Wz4cnFWK4O', 0, 0, NULL),
(25, 'dstrong', 'david', 'strong', NULL, 'neryxw@yahoo.com', '$2y$10$ps0QDKwjHompl.WlzVsKCOz7jh5yx8FI6ZKvjs3y/UdZBgNHYkvCe', 0, 0, NULL),
(26, 'founder1', 'Founder', 'Ofitem', NULL, 'founder@example.com', '$2y$10$aSckSlwt0Nf9P9MMJKm7VOLsxAAA0aoEjvzTSBonpfz8AQcF51Tpm', 0, 0, NULL),
(27, 'dd', 'Dinal', 'Dholiya', NULL, 'edwine@gmail.com', '$2y$10$M9cp8c4ooYkNsOQ8C9bEDu/KtO87k3UoWFaXAjaiePVYUU1Lgek6y', 0, 0, NULL),
(28, 'blaketur', 'Blake', 'Test', NULL, 'blaketur@buffalo.edu', '$2y$10$yV89otpwZttpHwguDk0FNeHy9PQaYh8d.mfcGg.TFZwiFuyBPgiV2', 0, 0, NULL),
(29, 'a', 'Alan', 'Hunt', NULL, 'ahunt@buffalo.edu', '$2y$10$44jiV5QdxbyVY7gAVgRaQe17Y9zM1C/FjeHRsfofvUu5E36TeDSim', 0, 0, NULL),
(30, '123pshah', 'Purva', 'Shah', NULL, '123@gmail.com', '$2y$10$Eh3YPQletGfhroCJApSqOe9khaEKb87w6rWIiu9uqJ3LmALX8OmFK', 0, 0, NULL),
(31, 'sahithre', 'sahith', 'reddy', NULL, 'sahith030@gmail.com', '$2y$10$bz9NHcKESTVjGePbs.Eev.vm.T9SfoeMAmGcVIHRx8uqX07KEqObS', 0, 0, NULL),
(32, 'feilin', 'fei', 'lin', NULL, 'feilin@gmail.com', '$2y$10$kj//FBs4YFX3i/6VsfD2.emoVpb0GUNIICe.RhORbdNx9Eq9c6kIW', 0, 0, NULL),
(33, 'testing11', 'Anno', 'Annuu', NULL, 'testing11@gmail.com', '$2y$10$2xOOr9M36gCdpFlhQPrMP.ItZ.9HvFBZsbWVy0vI7ycUC5Qcln7Ku', 0, 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `fk_chat_messages_user_id` (`user_id`),
  ADD KEY `fk_chat_messages_to_user_id` (`to_user_id`),
  ADD KEY `idx_chat_messages_created_at` (`conversation_id`,`created_at`);

--
-- Indexes for table `claims`
--
ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`conversation_id`),
  ADD KEY `idx_item` (`item_id`,`item_type`);

--
-- Indexes for table `found_items`
--
ALTER TABLE `found_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lost_items`
--
ALTER TABLE `lost_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`match_id`),
  ADD KEY `lost_item_id` (`lost_item_id`),
  ADD KEY `found_item_id` (`found_item_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_message_category` (`category`),
  ADD KEY `idx_message_status` (`status`),
  ADD KEY `idx_message_priority` (`priority`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `notification_system`
--
ALTER TABLE `notification_system`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notification_system_user_id` (`user_id`),
  ADD KEY `idx_notification_system_is_read` (`is_read`),
  ADD KEY `idx_notification_system_created_at` (`created_at`);

--
-- Indexes for table `otp_tokens`
--
ALTER TABLE `otp_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email` (`email`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `used` (`used`);

--
-- Indexes for table `retrieve_requests`
--
ALTER TABLE `retrieve_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `sign_up`
--
ALTER TABLE `sign_up`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQUE` (`full_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `claims`
--
ALTER TABLE `claims`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `conversation_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `found_items`
--
ALTER TABLE `found_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `lost_items`
--
ALTER TABLE `lost_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `match_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `notification_system`
--
ALTER TABLE `notification_system`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `otp_tokens`
--
ALTER TABLE `otp_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `retrieve_requests`
--
ALTER TABLE `retrieve_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sign_up`
--
ALTER TABLE `sign_up`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_messages_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_chat_messages_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `lost_items`
--
ALTER TABLE `lost_items`
  ADD CONSTRAINT `lost_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`lost_item_id`) REFERENCES `lost_items` (`id`),
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`found_item_id`) REFERENCES `found_items` (`id`);

--
-- Constraints for table `notification_system`
--
ALTER TABLE `notification_system`
  ADD CONSTRAINT `notification_system_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
