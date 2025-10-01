-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : db:3306
-- Généré le : jeu. 25 sep. 2025 à 09:06
-- Version du serveur : 8.0.43
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `digifaz`
--

-- --------------------------------------------------------

--
-- Structure de la table `card_contributions`
--

CREATE TABLE `card_contributions` (
  `id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `contribution_method` enum('online','cash_on_site') NOT NULL,
  `contribution_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `card_id` int DEFAULT NULL,
  `contributor_user_id` varchar(36) DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `collected_by_user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `celebration_types`
--

CREATE TABLE `celebration_types` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `contribution_campaigns`
--

CREATE TABLE `contribution_campaigns` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_fixed_amount` tinyint NOT NULL DEFAULT '0',
  `fixed_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','completed') NOT NULL DEFAULT 'active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by_user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `contribution_cards`
--

CREATE TABLE `contribution_cards` (
  `id` int NOT NULL,
  `card_number` varchar(50) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `initial_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `current_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `qr_code_url` varchar(255) DEFAULT NULL,
  `is_physical` tinyint NOT NULL DEFAULT '0',
  `status` enum('active','inactive','completed','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `campaign_id` int DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_calendar`
--

CREATE TABLE `mass_calendar` (
  `id` int NOT NULL,
  `mass_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('active','cancelled','disabled_requests') NOT NULL DEFAULT 'active',
  `notes` text,
  `created_by_user_id` varchar(36) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `celebration_type_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_requests`
--

CREATE TABLE `mass_requests` (
  `id` int NOT NULL,
  `requester_name` varchar(255) NOT NULL,
  `requester_phone` varchar(20) DEFAULT NULL,
  `requester_email` varchar(150) DEFAULT NULL,
  `message_additionnel` text,
  `status` enum('pending_payment','paid','scheduled','completed','cancelled','reported') NOT NULL DEFAULT 'pending_payment',
  `total_amount` decimal(10,2) NOT NULL,
  `cancellation_reason` text,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `requester_user_id` varchar(36) DEFAULT NULL,
  `mass_request_type_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_request_details`
--

CREATE TABLE `mass_request_details` (
  `id` int NOT NULL,
  `detail_type` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `mass_request_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_request_packages`
--

CREATE TABLE `mass_request_packages` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `mass_request_type_id` int DEFAULT NULL,
  `applies_to_mass_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_request_schedules`
--

CREATE TABLE `mass_request_schedules` (
  `id` int NOT NULL,
  `scheduled_date` date NOT NULL,
  `status` enum('scheduled','celebrated','transferred') NOT NULL DEFAULT 'scheduled',
  `transfer_to_mass_id` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `mass_request_id` int DEFAULT NULL,
  `mass_calendar_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mass_request_types`
--

CREATE TABLE `mass_request_types` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_amount` decimal(10,2) NOT NULL,
  `template_details` json DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `offerings`
--

CREATE TABLE `offerings` (
  `id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `message` text,
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` enum('cash','bank_transfer','mobile_money','card') NOT NULL DEFAULT 'cash',
  `anonymous_donor_info` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `offering_type_id` int DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `campaign_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `offering_campaigns`
--

CREATE TABLE `offering_campaigns` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `target_amount` decimal(15,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
  `image_url` varchar(500) DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `offering_types`
--

CREATE TABLE `offering_types` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `parishes`
--

CREATE TABLE `parishes` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `contact_email` varchar(150) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `bank_account_info` json DEFAULT NULL,
  `mobile_money_numbers` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `otpExpiresAt` timestamp NOT NULL,
  `tokenExpiresAt` timestamp NULL DEFAULT NULL,
  `isUsed` tinyint NOT NULL DEFAULT '0',
  `attempts` int NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('mobile_money','card','bank_transfer') NOT NULL,
  `slug` enum('OM','MTN','WAVE','MOOV','CARD','BANK') DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `integration_config` json DEFAULT NULL,
  `transaction_fee_percentage` decimal(5,2) DEFAULT NULL,
  `transaction_fee_payer` enum('donor','parish','shared') NOT NULL DEFAULT 'donor',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `data` json DEFAULT NULL,
  `status` enum('draft','final','archived') NOT NULL DEFAULT 'draft',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_id` varchar(36) DEFAULT NULL,
  `report_config_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reports_config`
--

CREATE TABLE `reports_config` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `config` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `reference` varchar(255) NOT NULL,
  `external_reference` varchar(255) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'XOF',
  `status` enum('pending','success','failed','refunded','cancelled') NOT NULL DEFAULT 'pending',
  `transaction_type` enum('mass_request','offering','contribution','refund') NOT NULL,
  `related_object_id` int NOT NULL,
  `fee_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_amount` decimal(10,2) DEFAULT NULL,
  `failure_reason` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_id` varchar(36) DEFAULT NULL,
  `payment_gateway_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(200) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive','suspended','guest') NOT NULL DEFAULT 'guest',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_has_roles`
--

CREATE TABLE `user_has_roles` (
  `user_id` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `permissions` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `card_contributions`
--
ALTER TABLE `card_contributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_1d96dfa9b62fb4cd917e6ba2a85` (`card_id`),
  ADD KEY `FK_aa2a3ba90380a1e35b776c3d91d` (`contributor_user_id`),
  ADD KEY `FK_50ce39b279167347f45e2827725` (`payment_id`),
  ADD KEY `FK_06f8478e0a34bf1dd3a5a825e29` (`collected_by_user_id`);

--
-- Index pour la table `celebration_types`
--
ALTER TABLE `celebration_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_70cfa0b4b38261bd5cc6350edb` (`name`);

--
-- Index pour la table `contribution_campaigns`
--
ALTER TABLE `contribution_campaigns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_eac55b2b0d8f51c082a01e643b` (`name`),
  ADD KEY `idx_campaign_status` (`status`),
  ADD KEY `FK_cf78c9b87da46ce28c2fb886d9d` (`created_by_user_id`);

--
-- Index pour la table `contribution_cards`
--
ALTER TABLE `contribution_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_d4564e835569b9cf738e71d033` (`card_number`),
  ADD KEY `idx_card_phone` (`phone_number`),
  ADD KEY `idx_card_campaign` (`campaign_id`),
  ADD KEY `idx_card_user` (`user_id`),
  ADD KEY `idx_card_number` (`card_number`);

--
-- Index pour la table `mass_calendar`
--
ALTER TABLE `mass_calendar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_7e98ffebabda1a137b2286fe98e` (`celebration_type_id`);

--
-- Index pour la table `mass_requests`
--
ALTER TABLE `mass_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_9fd9e5476e5a8476236da377beb` (`requester_user_id`),
  ADD KEY `FK_5c7178d07ba14b99d8961d80a01` (`mass_request_type_id`),
  ADD KEY `FK_6a161cb797ce83a0f74630ca5bc` (`payment_id`);

--
-- Index pour la table `mass_request_details`
--
ALTER TABLE `mass_request_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_1e5064075269f85769478701cc8` (`mass_request_id`);

--
-- Index pour la table `mass_request_packages`
--
ALTER TABLE `mass_request_packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ad314dbdee4067752c121a73816` (`mass_request_type_id`),
  ADD KEY `FK_e538ddc019ad2f91614e56256b1` (`applies_to_mass_id`);

--
-- Index pour la table `mass_request_schedules`
--
ALTER TABLE `mass_request_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_6e1cb22ae23e98cef6e39c06a5e` (`mass_request_id`),
  ADD KEY `FK_f524eff9cc21c0cc4f5aff168b0` (`mass_calendar_id`);

--
-- Index pour la table `mass_request_types`
--
ALTER TABLE `mass_request_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_3819838db5da5f8c44f1304f39` (`name`);

--
-- Index pour la table `offerings`
--
ALTER TABLE `offerings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_offering_status` (`status`),
  ADD KEY `idx_offering_amount` (`amount`),
  ADD KEY `idx_offering_date` (`created_at`),
  ADD KEY `FK_c7f903facbda6a909db123f38bb` (`offering_type_id`),
  ADD KEY `FK_1f99028fdad8920ebf5bd4be8b7` (`user_id`),
  ADD KEY `FK_c52a5a78fea96a78fa0482f286c` (`campaign_id`);

--
-- Index pour la table `offering_campaigns`
--
ALTER TABLE `offering_campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_campaign_status` (`status`),
  ADD KEY `idx_campaign_dates` (`start_date`,`end_date`);

--
-- Index pour la table `offering_types`
--
ALTER TABLE `offering_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_2ba25d9c762806798d33170e65` (`name`);

--
-- Index pour la table `parishes`
--
ALTER TABLE `parishes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_0c5bb9849cf031ff303e84203b` (`name`),
  ADD KEY `idx_parish_name` (`name`);

--
-- Index pour la table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_d905f911f872997feb55664dd7` (`name`);

--
-- Index pour la table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ca7a21eb95ca4625bd5eaef7e0c` (`user_id`),
  ADD KEY `FK_2175e422a1746cc833c83931386` (`report_config_id`);

--
-- Index pour la table `reports_config`
--
ALTER TABLE `reports_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_4d0462a12befd82c5979ae17fa` (`name`);

--
-- Index pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_dd85cc865e0c3d5d4be095d3f3` (`reference`),
  ADD KEY `FK_e9acc6efa76de013e8c1553ed2b` (`user_id`),
  ADD KEY `FK_ffaf391d65e368f230841b0a3b6` (`payment_gateway_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- Index pour la table `user_has_roles`
--
ALTER TABLE `user_has_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FK_386dc0042695c976845d36be948` (`role_id`);

--
-- Index pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_4a77d431a6b2ac981c342b13c9` (`name`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `card_contributions`
--
ALTER TABLE `card_contributions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `celebration_types`
--
ALTER TABLE `celebration_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `contribution_campaigns`
--
ALTER TABLE `contribution_campaigns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `contribution_cards`
--
ALTER TABLE `contribution_cards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_calendar`
--
ALTER TABLE `mass_calendar`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_requests`
--
ALTER TABLE `mass_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_request_details`
--
ALTER TABLE `mass_request_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_request_packages`
--
ALTER TABLE `mass_request_packages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_request_schedules`
--
ALTER TABLE `mass_request_schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mass_request_types`
--
ALTER TABLE `mass_request_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `offerings`
--
ALTER TABLE `offerings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `offering_types`
--
ALTER TABLE `offering_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reports_config`
--
ALTER TABLE `reports_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `card_contributions`
--
ALTER TABLE `card_contributions`
  ADD CONSTRAINT `FK_06f8478e0a34bf1dd3a5a825e29` FOREIGN KEY (`collected_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_1d96dfa9b62fb4cd917e6ba2a85` FOREIGN KEY (`card_id`) REFERENCES `contribution_cards` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_50ce39b279167347f45e2827725` FOREIGN KEY (`payment_id`) REFERENCES `transactions` (`id`),
  ADD CONSTRAINT `FK_aa2a3ba90380a1e35b776c3d91d` FOREIGN KEY (`contributor_user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `contribution_campaigns`
--
ALTER TABLE `contribution_campaigns`
  ADD CONSTRAINT `FK_cf78c9b87da46ce28c2fb886d9d` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `contribution_cards`
--
ALTER TABLE `contribution_cards`
  ADD CONSTRAINT `FK_821548f0cb2aedbd8f1040e0fdd` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_8e3ee3770f891f502fa8b3de02f` FOREIGN KEY (`campaign_id`) REFERENCES `contribution_campaigns` (`id`);

--
-- Contraintes pour la table `mass_calendar`
--
ALTER TABLE `mass_calendar`
  ADD CONSTRAINT `FK_7e98ffebabda1a137b2286fe98e` FOREIGN KEY (`celebration_type_id`) REFERENCES `celebration_types` (`id`);

--
-- Contraintes pour la table `mass_requests`
--
ALTER TABLE `mass_requests`
  ADD CONSTRAINT `FK_5c7178d07ba14b99d8961d80a01` FOREIGN KEY (`mass_request_type_id`) REFERENCES `mass_request_types` (`id`),
  ADD CONSTRAINT `FK_6a161cb797ce83a0f74630ca5bc` FOREIGN KEY (`payment_id`) REFERENCES `transactions` (`id`),
  ADD CONSTRAINT `FK_9fd9e5476e5a8476236da377beb` FOREIGN KEY (`requester_user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `mass_request_details`
--
ALTER TABLE `mass_request_details`
  ADD CONSTRAINT `FK_1e5064075269f85769478701cc8` FOREIGN KEY (`mass_request_id`) REFERENCES `mass_requests` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mass_request_packages`
--
ALTER TABLE `mass_request_packages`
  ADD CONSTRAINT `FK_ad314dbdee4067752c121a73816` FOREIGN KEY (`mass_request_type_id`) REFERENCES `mass_request_types` (`id`),
  ADD CONSTRAINT `FK_e538ddc019ad2f91614e56256b1` FOREIGN KEY (`applies_to_mass_id`) REFERENCES `mass_calendar` (`id`);

--
-- Contraintes pour la table `mass_request_schedules`
--
ALTER TABLE `mass_request_schedules`
  ADD CONSTRAINT `FK_6e1cb22ae23e98cef6e39c06a5e` FOREIGN KEY (`mass_request_id`) REFERENCES `mass_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_f524eff9cc21c0cc4f5aff168b0` FOREIGN KEY (`mass_calendar_id`) REFERENCES `mass_calendar` (`id`);

--
-- Contraintes pour la table `offerings`
--
ALTER TABLE `offerings`
  ADD CONSTRAINT `FK_1f99028fdad8920ebf5bd4be8b7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_c52a5a78fea96a78fa0482f286c` FOREIGN KEY (`campaign_id`) REFERENCES `offering_campaigns` (`id`),
  ADD CONSTRAINT `FK_c7f903facbda6a909db123f38bb` FOREIGN KEY (`offering_type_id`) REFERENCES `offering_types` (`id`);

--
-- Contraintes pour la table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `FK_2175e422a1746cc833c83931386` FOREIGN KEY (`report_config_id`) REFERENCES `reports_config` (`id`),
  ADD CONSTRAINT `FK_ca7a21eb95ca4625bd5eaef7e0c` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `FK_e9acc6efa76de013e8c1553ed2b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_ffaf391d65e368f230841b0a3b6` FOREIGN KEY (`payment_gateway_id`) REFERENCES `payment_gateways` (`id`);

--
-- Contraintes pour la table `user_has_roles`
--
ALTER TABLE `user_has_roles`
  ADD CONSTRAINT `FK_386dc0042695c976845d36be948` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_d2b980baf026ff8347d88ace6ee` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
