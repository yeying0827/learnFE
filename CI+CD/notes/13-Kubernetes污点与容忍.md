## Kubernetes污点与容忍：更好地分配集群资源

日常场景是复杂的，有时候可能遇到以下问题：

自动调度集群节点部署很不错，但是某几台服务器计划只给后端服务使用，这要怎么调度？后端服务依赖的服务器配置都很高，让前端服务也能调度过去不太合适，如何干预Pod部署到指定的其中几个服务器呢？

这就需要借助`Kubernetes`中的**污点与容忍度**去实现了

### 1. 什么是污点？什么是容忍度？

在`Kubernetes`中，`Pod`被部署到`Node`上面去的规则和逻辑是由`Kubernetes`的调度组件根据`Node`的剩余资源、地位、以及其他规则自动选择调度的。但在设计架构时，前端和后端往往服务器资源的分配都是不均衡的，甚至有的服务只能让特定的服务器来跑。

在这种情况下，选择自动调度是不均衡的，需要人工去干预匹配选择规则。需要给`Node`添加一个叫做污点的东西，以确保`Node`不被`Pod`调度到。

当给一个`Node`设置污点后，除非给`Pod`设置一个相对应的容忍度，这样`Pod`才能被调度上去。这就是污点和容忍的来源。

污点的格式是`key=value`，可以自定义自己的内容，就像是一组`Tag`一样。

### 2. 给Node设置污点

事先先增加一个新的节点`node2`。

给`Node`设置污点之前，先从v2复制一个新的`deployment`版本`v3`。并将之前的`pod`名称、`service`名称从v2改成v3：

```shell
[yy@master deployment]$ cp v2.yaml v3.yaml
[yy@master deployment]$ vim v3.yaml
[yy@master deployment]$ kubectl apply -f v3.yaml 
deployment.apps/front-v3 created
service/front-service-v3 created
[yy@master deployment]$ 
```

然后使用`kubectl get pod`命令获取Pod列表，接着用`kubectl describe pod`命令查看`Pod3`的运行详情：

```shell
[yy@master deployment]$ kubectl describe pod front-v3-6444cc66b4-6csjn
Name:         front-v3-6444cc66b4-6csjn
Namespace:    default
Priority:     0
Node:         node2/10.211.55.11
Start Time:   Sat, 06 Aug 2022 16:43:11 +0800
Labels:       app=nginx-v3
              pod-template-hash=6444cc66b4
Annotations:  <none>
Status:       Running
IP:           10.244.2.4
IPs:
  IP:           10.244.2.4
Controlled By:  ReplicaSet/front-v3-6444cc66b4
...
```

`Node`一栏，k8s将新创建的`Pod`调度部署到了新增的`node2`节点上。下面我们给`node2`设置污点，让`Pod`不会调度到`node2`节点上。

给`Node`添加污点，只需要使用`kubectl taint`命令：

```shell
kubectl taint nodes [NodeName] [key]=[value]:NoSchedule
```

`NodeName`为要添加污点的`node`名称；`key`和`value`为一组键值对，代表一组标示标签；`NoSchedule`为不被调度的意思，和它同级别的还有其他的值：

`PreferNoSchedule`和`NoExecute`。

给`Node2`添加完一个污点后，提示`node/node2 tainied`表示添加成功。

```shell
[yy@master deployment]$ kubectl taint nodes node2 v3=true:NoSchedule
node/node2 tainted
```

删掉已经创建的`v3`版本的`Pod`，让`Kubernetes`重建`Pod`，看看新`Pod`还会不会被调度到`node2`上面去：

```shell
kubectl delete pod [POD_NAME]
kubectl describe pod [POD_NAME]
```

```shell
# 查看pod列表
[yy@master deployment]$ kubectl get pod
NAME                        READY   STATUS    RESTARTS        AGE
...
front-v3-6444cc66b4-7lnxt   1/1     Running   0               2d17h
front-v3-6444cc66b4-c9nkb   1/1     Running   0               2d17h
front-v3-6444cc66b4-cs6dh   1/1     Running   0               2d17h
front-v3-6444cc66b4-dmfkn   1/1     Running   0               2d17h
front-v3-6444cc66b4-js852   1/1     Running   0               2d17h
front-v3-6444cc66b4-qx6k8   1/1     Running   0               2d17h
front-v3-6444cc66b4-r2vmd   1/1     Running   0               2d17h
front-v3-6444cc66b4-s2b4d   1/1     Running   0               2d17h
front-v3-6444cc66b4-t9fzt   1/1     Running   0               2d17h
front-v3-6444cc66b4-w5ksk   1/1     Running   0               2d17h
...
# 逐个查看被调度到node2的pod
[yy@master deployment]$ kubectl describe pod front-v3-6444cc66b4-7lnxt
# 将被调度到node2的pod逐个删除
[yy@master deployment]$ kubectl delete pod front-v3-6444cc66b4-dmfkn
pod "front-v3-6444cc66b4-dmfkn" deleted
# 重新获取pod列表
[yy@master deployment]$ kubectl get pod
NAME                        READY   STATUS    RESTARTS        AGE
...
front-v3-6444cc66b4-7lnxt   1/1     Running   0               2d17h
front-v3-6444cc66b4-c9nkb   1/1     Running   0               2d17h
front-v3-6444cc66b4-cs6dh   1/1     Running   0               2d17h
front-v3-6444cc66b4-gl2st   1/1     Running   0               79s
front-v3-6444cc66b4-h9c7w   1/1     Running   0               4m37s
front-v3-6444cc66b4-js852   1/1     Running   0               2d17h
front-v3-6444cc66b4-r2vmd   1/1     Running   0               2d17h
front-v3-6444cc66b4-r7krs   1/1     Running   0               2m6s
front-v3-6444cc66b4-s797s   1/1     Running   0               2m54s
front-v3-6444cc66b4-w5ksk   1/1     Running   0               2d17h
...
# 查看重新生成的几个pod
[yy@master deployment]$ kubectl describe pod front-v3-6444cc66b4-s797s
```

可以看到重新生成的pod都被调度到`node1`上了。因为`node2`添加了污点，不会被调度到。此时污点生效。

### 3. 给Pod 设置容忍度

想让`Pod`被调度到添加了污点的`Node`上面，需要在`Pod`一侧添加相对应的容忍度。

可以编辑`front-v3`的`development`配置文件，在`template.spec`下添加以下字段：

```yaml
tolerations:
- key: "v3"
  operator: "Equal"
  value: "true"
  effect: "NoSchedule"
```

字段的含义是，给`Pod`设置一组容忍度，以匹配对应的`Node`的污点。`key`和`value`是配置`Node`污点的`key`和`value`；`effect`是`Node`污点的调度效果，和`Node`的设置项也是匹配的；`operator`是运算符，`equal`代表只有`key`和`value`相等才算数，也可以配置`exists`，代表只要`key`存在就匹配，不需要校验`value`的值。

修改保存后，使用`kubectl apply -f`命令使配置生效，接着查看新Pod的调度结果：

```shell
[yy@master deployment]$ kubectl get pod
NAME                        READY   STATUS    RESTARTS       AGE
...
front-v3-5c684bf46-5kmxg    1/1     Running   0              2m44s
front-v3-5c684bf46-6krbw    1/1     Running   0              2m48s
front-v3-5c684bf46-9hx28    1/1     Running   0              2m44s
front-v3-5c684bf46-bctr9    1/1     Running   0              2m48s
front-v3-5c684bf46-dltmc    1/1     Running   0              2m48s
front-v3-5c684bf46-h88tp    1/1     Running   0              2m38s
front-v3-5c684bf46-mf5kk    1/1     Running   0              2m48s
front-v3-5c684bf46-nd78x    1/1     Running   0              2m44s
front-v3-5c684bf46-xnjdt    1/1     Running   0              2m48s
front-v3-5c684bf46-xtwfv    1/1     Running   0              2m41s
...
[yy@master deployment]$ kubectl describe pod front-v3-5c684bf46-xtwfv 
Name:         front-v3-5c684bf46-xtwfv
Namespace:    default
Priority:     0
Node:         node2/10.211.55.11
Start Time:   Tue, 09 Aug 2022 11:57:11 +0800
Labels:       app=nginx-v3
              pod-template-hash=5c684bf46
Annotations:  <none>
Status:       Running
IP:           10.244.2.11
IPs:
  IP:           10.244.2.11
Controlled By:  ReplicaSet/front-v3-5c684bf46
```

可以看到，在容忍度的作用下，`Pod`重新被调度到了`node2`节点上。

### 4. 修改/删除Node 的污点

修改污点依然使用`kubectl taint`命令就可以：

```shell
kubectl taint nodes [NodeName] [key]=[value]:NoSchedule --overwrite
```

只需要对`value`和作用的值进行修改即可，后面添加参数`--overwrite`代表覆盖之前的数据。

```shell
[yy@master deployment]$ kubectl taint node node2 v3=false:NoSchedule --overwrite
node/node2 modified
[yy@master deployment]$ kubectl delete pod front-v3-5c684bf46-xtwfv 
pod "front-v3-5c684bf46-xtwfv" deleted
[yy@master deployment]$ kubectl get pod
NAME                        READY   STATUS    RESTARTS       AGE
...
front-v3-5c684bf46-rf48l    1/1     Running   0              9s
...
[yy@master deployment]$ kubectl describe pod front-v3-5c684bf46-rf48l
Name:         front-v3-5c684bf46-rf48l
Namespace:    default
Priority:     0
Node:         node1/10.211.55.10
Start Time:   Tue, 09 Aug 2022 12:13:53 +0800
Labels:       app=nginx-v3
              pod-template-hash=5c684bf46
...
```

可以看到修改污点之后，重新创建的pod匹配不到污点，就不会被调度到`node2`。

删除污点也很简单，只需要加个`-`号就可以删除污点：

```shell
kubectl taint nodes [NodeName] [key]-
```

提示`node/[NODE_NAME] untainted`代表删除成功。

```shell
[yy@master deployment]$ kubectl taint nodes node2 v3-
node/node2 untainted
[yy@master deployment]$ kubectl delete pod front-v3-5c684bf46-rf48l
pod "front-v3-5c684bf46-rf48l" deleted
[yy@master deployment]$ kubectl get pod
NAME                        READY   STATUS    RESTARTS       AGE
...
front-v3-5c684bf46-kpw4n    1/1     Running   0              7s
...
[yy@master deployment]$ kubectl describe pod front-v3-5c684bf46-kpw4n
Name:         front-v3-5c684bf46-kpw4n
Namespace:    default
Priority:     0
Node:         node2/10.211.55.11
Start Time:   Tue, 09 Aug 2022 12:18:21 +0800
Labels:       app=nginx-v3
              pod-template-hash=5c684bf46
...
```

可以看到重新创建的pod又可以被调度到`node2`了。