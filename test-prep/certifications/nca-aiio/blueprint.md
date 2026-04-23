# NCA-AIIO Exam Blueprint
## NVIDIA Certified Associate — AI Infrastructure & Operations

**Exam code:** NCA-AIIO
**Format:** Multiple choice, ~50 questions, 90 minutes
**Passing score:** ~70%
**Audience:** Infrastructure engineers deploying and operating NVIDIA AI systems

---

## Domain Weights

| # | Domain | Weight | Questions (of 50) |
|---|--------|--------|-------------------|
| 1 | Essential AI Knowledge | 38% | ~19 |
| 2 | AI Infrastructure | 40% | ~20 |
| 3 | AI Operations | 22% | ~11 |

---

## Domain 1 — Essential AI Knowledge (38%)

### 1.1 AI/ML Fundamentals
- Understand the difference between AI, machine learning, and deep learning
- Know the role of neural networks: layers, weights, activations, backpropagation
- Understand training vs inference pipelines and their different resource profiles

### 1.2 GPU Architecture for AI
- Why GPUs outperform CPUs for deep learning (SIMT, massive parallelism)
- CUDA cores vs Tensor Cores — know which accelerates matrix math (Tensor Cores)
- Warp = 32 threads executing same instruction simultaneously (SIMT model)
- GPU memory hierarchy: L1/L2 cache, shared memory, HBM (High Bandwidth Memory)

### 1.3 Numerical Precision
- FP32 (full precision), FP16 (half precision — lower dynamic range), BF16 (Brain Float — same exponent as FP32, less mantissa)
- INT8 quantization for inference: lower memory, higher throughput, slight accuracy trade-off
- FP8 (Hopper architecture): training at lower precision for performance gains
- Mixed precision training: keep FP32 master weights, compute in FP16/BF16

### 1.4 NVIDIA GPU Product Families
- **A100** (Ampere): 80 GB HBM2e, 2nd-gen NVLink, up to 7 MIG instances
- **H100** (Hopper): 80 GB HBM3, 4th-gen NVLink, FP8 support, Transformer Engine
- **Grace Hopper (GH200)**: ARM CPU + H100 GPU on unified memory fabric (NVLink-C2C)
- **L40S**: PCIe form factor, optimized for inference and generative AI

### 1.5 NVIDIA Software Ecosystem
- **CUDA**: parallel computing platform and API for GPU programming
- **cuDNN**: GPU-accelerated library for deep neural network primitives
- **TensorRT**: inference optimization — layer fusion, quantization, engine building
- **Triton Inference Server**: multi-framework inference serving platform (not TensorRT)
- **NCCL**: GPU-to-GPU collective communication library (AllReduce, Broadcast)
- **NGC (NVIDIA GPU Cloud)**: container registry with pre-optimized AI frameworks

### 1.6 AI Use Cases by Vertical
- Healthcare: medical imaging, drug discovery
- Financial services: fraud detection, risk modeling
- Manufacturing: predictive maintenance, defect detection
- NLP/LLM: training and serving large language models
- Autonomous vehicles: real-time inference on sensor data

### 1.7 Transformer Architecture
- Attention mechanism: weights importance of each token relative to all others
- Key insight: parallel processing (unlike RNNs), scales well with GPU parallelism
- LLM training: data-parallel + model-parallel + pipeline-parallel strategies

### 1.8 Multi-Instance GPU (MIG)
- Hardware-level GPU partitioning with full memory and fault isolation
- Available on A100, H100, and select other GPUs
- A100: up to 7 MIG instances (1g.10gb, 2g.20gb, 3g.40gb, 4g.40gb, 7g.80gb profiles)
- MIG ≠ MPS: MIG is hardware-isolated; MPS is software-shared (no isolation)

---

## Domain 2 — AI Infrastructure (40%)

### 2.1 NVIDIA DGX Systems
- **DGX A100**: 8× A100 80 GB, 600 GB/s NVLink 3.0, 8× InfiniBand HDR 200 Gb/s
- **DGX H100**: 8× H100 80 GB, 900 GB/s NVLink 4.0, 8× InfiniBand NDR 400 Gb/s
- NVSwitch connects all 8 GPUs in an all-to-all mesh at full NVLink bandwidth
- DGX is a purpose-built AI training system (not a general server with GPUs added)

### 2.2 GPU Interconnects
- **NVLink**: intra-node GPU-to-GPU interconnect (inside a server)
  - NVLink 3.0: 600 GB/s bidirectional (A100)
  - NVLink 4.0: 900 GB/s bidirectional (H100)
- **NVSwitch**: switch chip enabling all-to-all NVLink between all GPUs in a node
- **PCIe**: connects CPU to GPU; Gen 4: 64 GB/s, Gen 5: 128 GB/s — much lower than NVLink

### 2.3 Data Center Networking for AI
- **InfiniBand**: RDMA-native, sub-microsecond latency
  - HDR: 200 Gb/s per port
  - NDR: 400 Gb/s per port
- **RoCE (RDMA over Converged Ethernet)**: RDMA on Ethernet — lower cost, slightly higher latency
- **Ethernet (standard)**: not recommended for tight AI training collectives; used for storage/management
- GPUDirect RDMA: NIC reads/writes GPU memory directly, bypassing CPU and host memory

### 2.4 GPUDirect Technologies
- **GPUDirect RDMA**: NIC ↔ GPU direct, eliminates CPU copy overhead for inter-node comms
- **GPUDirect Storage**: NVMe/SAN ↔ GPU direct, eliminates CPU for storage I/O
- **GPUDirect P2P**: GPU ↔ GPU over PCIe without host memory bounce

### 2.5 NVIDIA BlueField DPU
- **DPU (Data Processing Unit)**: SmartNIC with ARM cores, offloads networking, storage, and security
- Offloads: firewall, encryption, storage virtualization, RDMA processing → frees host CPU
- BlueField-3: 400 GbE / HDR InfiniBand, ARM Cortex-A78 cores, onboard memory
- DPU ≠ GPU: DPU handles infrastructure workloads; GPU handles compute workloads

### 2.6 Storage for AI Workloads
- Training requires high sequential read throughput (feeding GPU data pipelines)
- Checkpoint writes are sequential, large; require high write bandwidth
- **GPFS/Lustre/BeeGFS/WEKA**: parallel file systems for high-throughput AI storage
- NVMe SSDs: low latency, high IOPS — good for dataset staging and checkpointing
- Object storage (S3): cheap, scalable — good for raw datasets, not active training

### 2.7 Networking Requirements for AI Clusters
- AllReduce during distributed training requires high bandwidth, low latency fabric
- Rule of thumb: network bandwidth should not be the bottleneck vs GPU compute
- 8-GPU DGX → 400 Gb/s InfiniBand NDR per node to avoid collective bottleneck
- Fat-tree or dragonfly topologies for multi-rack GPU clusters

### 2.8 Data Center Physical Infrastructure
- **Power**: DGX H100 ≈ 10.2 kW per node; plan for 2× headroom for spikes
- **Cooling**: High-density GPU racks need rear-door heat exchangers or direct liquid cooling (DLC)
- **PDU**: 3-phase power distribution; DGX requires 200–240V 3-phase input
- **BMC (Baseboard Management Controller)**: out-of-band management, independent of OS
  - Functions: power on/off, sensor monitoring (temp/fans/voltage), console redirection, firmware update

---

## Domain 3 — AI Operations (22%)

### 3.1 NVIDIA Base Command Platform
- Full AI lifecycle management: job orchestration, cluster management, data management
- Integrates with Slurm and Kubernetes
- Provides NGC catalog access, experiment tracking, and multi-tenant cluster sharing
- Base Command ≠ Slurm: BCP is an AI-specific platform layer on top of job schedulers

### 3.2 Container Orchestration for GPU
- **NVIDIA GPU Operator**: automates GPU driver, plugin, and runtime setup in Kubernetes
- **NVIDIA Device Plugin**: exposes GPU resources to Kubernetes scheduler
- **Container Runtime**: nvidia-container-runtime enables GPU access inside containers

### 3.3 Workload Scheduling
- **Slurm**: dominant HPC job scheduler — queue management, resource accounting, job dependencies
  - gres (generic resources) for GPU allocation: `--gres=gpu:8`
  - Partitions, QOS, fairshare scheduling
- **Kubernetes**: container orchestration — good for inference serving, microservices
- Slurm vs Kubernetes: use Slurm for batch training jobs, Kubernetes for inference/serving

### 3.4 GPU Monitoring and Management
- **DCGM (Data Center GPU Manager)**: cluster-wide GPU health, telemetry, diagnostics
  - Metrics: SM utilization, memory bandwidth, temperature, power draw, ECC errors
  - Integrates with Prometheus, Grafana, Kubernetes
- **nvidia-smi**: single-GPU command-line tool (not for cluster-scale monitoring)
- **NVML (NVIDIA Management Library)**: API for GPU management (DCGM uses NVML)

### 3.5 MIG vs MPS
| Feature | MIG | MPS |
|---------|-----|-----|
| Isolation | Hardware (silicon-level) | Software (process-level) |
| Memory isolation | Yes | No |
| Fault isolation | Yes | No |
| Overhead | Low (hardware) | Low (software) |
| GPU generations | A100, H100, select others | Pascal and newer |
| Use case | Strict multi-tenant isolation | Concurrent jobs, no security requirement |

### 3.6 AI Infrastructure Lifecycle
- Firmware updates: use BMC or NVIDIA Update Manager
- Driver updates: rolling updates in Kubernetes via GPU Operator
- Cluster health checks: DCGM diagnostics (`dcgmi diag -r 3`)
- Capacity planning: monitor GPU utilization, memory pressure, network saturation

---

## Official Study Resources

| Resource | URL |
|----------|-----|
| NVIDIA NCA-AIIO Exam Page | https://www.nvidia.com/en-us/training/certification/ |
| Official Study Guide PDF | Included in certifications/nca-aiio/study-guide.pdf |
| NVIDIA DGX Documentation | https://docs.nvidia.com/dgx/ |
| DCGM Documentation | https://docs.nvidia.com/datacenter/dcgm/ |
| NGC Catalog | https://ngc.nvidia.com |

---

## Under-Represented Objectives (Priority for Additional Questions)

Based on current 20-question bank gaps:
- **2.7** Networking requirements for AI clusters (AllReduce topology, bandwidth sizing)
- **2.8** DC protocols and physical infra (power/cooling numbers)
- **1.6** NVIDIA solutions use cases by industry vertical
- **3.1** Base Command Platform specifics (vs Slurm, vs Kubernetes)
- **3.2** Kubernetes GPU Operator specifics
