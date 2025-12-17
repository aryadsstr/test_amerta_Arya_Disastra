/*
 Navicat Premium Dump SQL

 Source Server         : mysql local
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : amerta_test_aryadisastra

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 17/12/2025 12:25:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for mahasiswa
-- ----------------------------
DROP TABLE IF EXISTS `mahasiswa`;
CREATE TABLE `mahasiswa`  (
  `id_mahasiswa` int NOT NULL AUTO_INCREMENT,
  `nama_mahasiswa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_mahasiswa`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1006 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mahasiswa
-- ----------------------------
INSERT INTO `mahasiswa` VALUES (1001, 'Budi');
INSERT INTO `mahasiswa` VALUES (1002, 'Aris');
INSERT INTO `mahasiswa` VALUES (1003, 'Panji');
INSERT INTO `mahasiswa` VALUES (1005, 'Arya');

-- ----------------------------
-- Table structure for matakuliah
-- ----------------------------
DROP TABLE IF EXISTS `matakuliah`;
CREATE TABLE `matakuliah`  (
  `id_matakuliah` int NOT NULL AUTO_INCREMENT,
  `nama_matakuliah` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id_matakuliah`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 105 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matakuliah
-- ----------------------------
INSERT INTO `matakuliah` VALUES (101, 'Struktur Data');
INSERT INTO `matakuliah` VALUES (102, 'Rangkaian Digital');
INSERT INTO `matakuliah` VALUES (103, 'Aljabar Linear');
INSERT INTO `matakuliah` VALUES (104, 'Sistem Informatika');

-- ----------------------------
-- Table structure for nilai
-- ----------------------------
DROP TABLE IF EXISTS `nilai`;
CREATE TABLE `nilai`  (
  `id_nilai` int NOT NULL AUTO_INCREMENT,
  `id_mahasiswa` int NULL DEFAULT NULL,
  `id_matakuliah` int NULL DEFAULT NULL,
  `nilai` int NULL DEFAULT NULL,
  PRIMARY KEY (`id_nilai`) USING BTREE,
  INDEX `id_matakuliah`(`id_matakuliah` ASC) USING BTREE,
  UNIQUE INDEX `uniq_mahasiswa_matkul`(`id_mahasiswa` ASC, `id_matakuliah` ASC) USING BTREE,
  CONSTRAINT `nilai_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `mahasiswa` (`id_mahasiswa`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `nilai_ibfk_2` FOREIGN KEY (`id_matakuliah`) REFERENCES `matakuliah` (`id_matakuliah`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1000013 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of nilai
-- ----------------------------
INSERT INTO `nilai` VALUES (1000003, 1001, 103, 70);
INSERT INTO `nilai` VALUES (1000004, 1002, 101, 90);
INSERT INTO `nilai` VALUES (1000005, 1002, 102, 55);
INSERT INTO `nilai` VALUES (1000006, 1002, 103, 90);
INSERT INTO `nilai` VALUES (1000007, 1003, 101, 73);
INSERT INTO `nilai` VALUES (1000008, 1003, 102, 81);
INSERT INTO `nilai` VALUES (1000009, 1003, 103, 61);
INSERT INTO `nilai` VALUES (1000010, 1001, 102, 100);
INSERT INTO `nilai` VALUES (1000011, 1001, 101, 90);
INSERT INTO `nilai` VALUES (1000012, 1005, 104, 100);

SET FOREIGN_KEY_CHECKS = 1;
