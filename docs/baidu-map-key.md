# 百度地图API Key申请指南

## 申请步骤

### 1. 注册百度账号

访问 [百度账号注册页面](https://passport.baidu.com/) 注册账号。

### 2. 登录百度开放平台

访问 [百度地图开放平台](https://lbsyun.baidu.com/) 并登录。

### 3. 创建应用

1. 进入 [控制台](https://lbsyun.baidu.com/apiconsole/key)
2. 点击"创建应用"
3. 填写应用信息：
   - **应用名称**：15分钟生活圈助手
   - **应用类型**：选择"浏览器端"
   - **启用服务**：
     - ✅ 地图展示
     - ✅ 地图检索
     - ✅ 路线规划
     - ✅ 地理编码
   - **Referer白名单**：
     - 开发环境：`http://localhost:*`
     - 生产环境：`你的域名`

4. 点击"提交"

### 4. 获取AK（API Key）

创建成功后，在应用列表中可以看到生成的 **AK**（API Key），格式类似：
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. 配置环境变量

将获取的AK配置到项目的 `.env` 文件中：

```env
BAIDU_MAP_AK=你的AK值
```

## API配额说明

| API | 免费配额 | 说明 |
|-----|---------|------|
| 地理编码 | 100万次/天 | 地址转坐标 |
| 逆地理编码 | 100万次/天 | 坐标转地址 |
| POI检索 | 100万次/天 | 搜索周边设施 |
| 步行路径规划 | 100万次/天 | 计算步行路线 |
| 距离矩阵 | 100万次/天 | 批量计算距离 |

## 注意事项

1. **Key安全**：不要将AK提交到公开的代码仓库
2. **配额限制**：免费配额足够开发和演示使用
3. **QPS限制**：并发请求不要超过5次/秒
4. **缓存策略**：建议对相同请求结果进行缓存，减少API调用

## 申请企业认证（可选）

如果需要更高的配额，可以申请企业认证：
1. 在控制台点击"企业认证"
2. 上传营业执照等材料
3. 等待审核（1-3个工作日）

## 相关文档

- [百度地图开放平台文档](https://lbsyun.baidu.com/index.php?title=%E9%A6%96%E9%A1%B5)
- [Web服务API文档](https://lbsyun.baidu.com/index.php?title=webapi)
- [JavaScript API文档](https://lbsyun.baidu.com/index.php?title=jspopularGL)
