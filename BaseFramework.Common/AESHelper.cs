﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BaseFramework.Common
{
    public class AESHelper
    {
        static AESHelper()
        {
            iv = System.Text.Encoding.UTF8.GetBytes("hello!!!hello!!!");
            key = System.Text.Encoding.UTF8.GetBytes("howareyou!wow!!!");
        }

        #region 密钥和向量
        private static byte[] iv;
        private static byte[] key;
        private static CipherMode cipherMode = CipherMode.CBC;
        private static PaddingMode paddingMode = PaddingMode.PKCS7;
        #endregion

        #region AES加密
        /// <summary>
        /// AES字符串加密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string Encrypt(string text)
        {
            byte[] data = Encoding.UTF8.GetBytes(text);
            byte[] release = AESEncrypt(data, iv, key, cipherMode, paddingMode);
            return Convert.ToBase64String(release);
        }

        /// <summary>
        /// AES字符串加密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string Encrypt(string text, byte[] keys)
        {
            var _iv = new byte[16];
            var _key = new byte[16];
            Array.Copy(keys, 0, _iv, 0, 16);
            Array.Copy(keys, 16, _key, 0, 16);

            byte[] data = Encoding.UTF8.GetBytes(text);
            byte[] release = AESEncrypt(data, _iv, _key, cipherMode, paddingMode);
            return Convert.ToBase64String(release);
        }

        /// <summary>
        /// AES加密
        /// </summary>
        /// <param name="inputdata">输入的数据</param>
        /// <param name="iv">向量128位</param>
        /// <param name="strKey">加密密钥</param>
        /// <returns></returns>
        public static byte[] AESEncrypt(byte[] inputdata, byte[] iv, byte[] key, CipherMode cipherMode, PaddingMode paddingMode)
        {
            AesCryptoServiceProvider aes = new AesCryptoServiceProvider();
            //设置密钥及密钥向量
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = cipherMode;
            aes.Padding = paddingMode;

            ICryptoTransform transform = aes.CreateEncryptor();
            byte[] data = transform.TransformFinalBlock(inputdata, 0, inputdata.Length);
            aes.Clear();
            return data;

        }
        #endregion

        #region AES解密
        /// <summary>
        /// AES字符串解密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string Decrypt(string text)
        {
            try
            {
                byte[] data = Convert.FromBase64String(text);
                byte[] release = AESDecrypt(data, iv, key, cipherMode, paddingMode);
                return Encoding.UTF8.GetString(release);
            }
            catch (Exception e)
            {
                throw new Exception("错误的密文");
            }

        }

        /// <summary>
        /// AES字符串解密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string Decrypt(string text, byte[] keys)
        {
            var _iv = new byte[16];
            var _key = new byte[16];
            Array.Copy(keys, 0, _iv, 0, 16);
            Array.Copy(keys, 16, _key, 0, 16);

            try
            {
                byte[] data = Convert.FromBase64String(text);
                byte[] release = AESDecrypt(data, _iv, _key, cipherMode, paddingMode);
                return Encoding.UTF8.GetString(release);
            }
            catch (Exception e)
            {
                throw new Exception("错误的密文");
            }

        }

        /// <summary>
        /// AES解密
        /// </summary>
        /// <param name="inputdata">输入的数据</param>
        /// <param name="iv">向量128</param>
        /// <param name="strKey">key</param>
        /// <returns></returns>
        public static byte[] AESDecrypt(byte[] inputdata, byte[] iv, byte[] key, CipherMode cipherMode, PaddingMode paddingMode)
        {
            AesCryptoServiceProvider aes = new AesCryptoServiceProvider();
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = cipherMode;
            aes.Padding = paddingMode;

            ICryptoTransform transform = aes.CreateDecryptor();
            byte[] data = null;
            data = transform.TransformFinalBlock(inputdata, 0, inputdata.Length);
            aes.Clear();
            return data;
        }
        #endregion
    }
}
