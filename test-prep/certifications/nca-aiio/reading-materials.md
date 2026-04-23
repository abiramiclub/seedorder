# NCA-AIIO Reading Materials — Key Facts Extracted

All key facts from official and recommended reading sources for the NCA-AIIO exam, organized by topic. Use this as the source material when generating additional questions.

---

## GPU Architecture & CUDA

**GPU vs CPU for AI:**
- GPUs have thousands of smaller cores (CUDA cores) optimized for parallel throughput
- CPUs have fewer, faster cores optimized for sequential single-threaded latency
- Deep learning is embarrassingly parallel (matrix multiply) → GPUs dominate
- GPU advantage is QUANTITY of parallel cores, not individual core speed

**CUDA Execution Model:**
- SIMT: Single Instruction Multiple Threads — all threads in a warp run the same instruction
- Warp = 32 threads (fundamental scheduling unit)
- Thread block = up to 1024 threads; multiple warps per block
- Grid = multiple thread blocks
- Tensor Cores: specialized hardware units that perform mixed-precision matrix multiply-accumulate (MMA) in one cycle; introduced in Volta, enhanced in each subsequent arch

**GPU Memory Hierarchy:**
- Registers (fastest, per-thread)
- Shared memory (per block, ~192 KB on A100 SM)
- L1/L2 cache
- HBM2e/HBM3 (main GPU memory, highest bandwidth)
- PCIe/NVLink for CPU↔GPU or GPU↔GPU

**A100 key specs:**
- 80 GB HBM2e, 2 TB/s memory bandwidth
- 6912 CUDA cores, 432 Tensor Cores (3rd gen)
- NVLink 3.0: 600 GB/s bidirectional
- PCIe Gen 4: 64 GB/s bidirectional
- TDP: 400 W (PCIe) / 400 W (SXM)
- MIG: up to 7 instances

**H100 key specs:**
- 80 GB HBM3, 3.35 TB/s memory bandwidth
- 16 896 FP32 CUDA cores, 528 Tensor Cores (4th gen)
- NVLink 4.0: 900 GB/s bidirectional
- PCIe Gen 5: 128 GB/s
- TDP: 700 W (SXM5)
- FP8 support (first NVIDIA GPU with FP8 training)
- Transformer Engine: auto-selects FP8/BF16 per layer
- MIG: up to 7 instances

---

## Numerical Precision

| Format | Bits | Exponent | Mantissa | Notes |
|--------|------|----------|----------|-------|
| FP32 | 32 | 8 | 23 | Training master weights |
| FP16 | 16 | 5 | 10 | Less dynamic range than FP32 → can cause overflow/underflow |
| BF16 | 16 | 8 | 7 | Same exponent as FP32 → same dynamic range, less precision |
| FP8 E4M3 | 8 | 4 | 3 | Forward pass (inference-like accuracy) |
| FP8 E5M2 | 8 | 5 | 2 | Backward pass (wider range for gradients) |
| INT8 | 8 | — | — | Post-training quantization for inference; 2-4× throughput vs FP16 |

**Mixed precision training (standard practice):**
1. Maintain FP32 master copy of weights
2. Cast to FP16/BF16 for forward + backward pass
3. Accumulate gradients in FP32
4. Update master weights in FP32

**Loss scaling:** Required with FP16 (not BF16) to prevent underflow in gradients.

---

## TensorRT

- **What it is:** NVIDIA's inference optimization SDK — takes a trained model, produces a highly optimized "engine" for a specific GPU
- **Key optimizations:** Layer fusion, kernel auto-tuning, INT8/FP16 calibration, dynamic shapes
- **Supported frameworks:** PyTorch (torch.compile + TensorRT backend), TensorFlow, ONNX
- **Output:** A serialized `.engine` file, GPU-specific (cannot run on different GPU arch)
- **NOT for training:** TensorRT is inference only
- **NOT a serving framework:** use Triton to deploy TensorRT engines at scale
- TensorRT-LLM: extension of TensorRT specifically for LLM inference optimization

---

## Triton Inference Server

- **What it is:** Open-source inference serving platform (not the same as Triton GPU programming language)
- Supports multiple frameworks: TensorRT, PyTorch, TensorFlow, ONNX, FIL, Python backends
- Handles concurrent model instances, dynamic batching, model ensemble pipelines
- Exposes HTTP and gRPC APIs
- Integrates with Kubernetes via NVIDIA GPU Operator
- **NOT** an optimization tool (that's TensorRT) — Triton *deploys* optimized models

---

## DCGM (Data Center GPU Manager)

- Cluster-wide GPU monitoring, health checks, and policy management
- Metrics collected: GPU utilization, memory utilization, memory bandwidth, PCIe traffic, power draw, temperature, fan speed, ECC error counts, NVLink errors
- Integrates with Prometheus (via dcgm-exporter), Grafana, Kubernetes
- **dcgmi diag -r 3**: run level-3 diagnostics (comprehensive hardware validation)
- **dcgmi discovery**: discover GPUs in the system
- DCGM is NOT a real-time profiling tool (use Nsight for per-kernel profiling)
- nvidia-smi: single-node CLI for GPU status — NOT a replacement for DCGM at scale

---

## NVLink & NVSwitch

**NVLink:**
- High-speed GPU-to-GPU interconnect within a server (intra-node)
- NVLink 3.0 (A100): 600 GB/s bidirectional total
- NVLink 4.0 (H100): 900 GB/s bidirectional total
- Much higher bandwidth than PCIe Gen 4 (64 GB/s) or Gen 5 (128 GB/s)

**NVSwitch:**
- A dedicated switch chip that enables ALL-TO-ALL NVLink connectivity between all 8 GPUs in a DGX
- Without NVSwitch: each GPU can only connect to a few others via NVLink lanes
- With NVSwitch: any GPU can communicate with any other GPU at full NVLink bandwidth simultaneously
- DGX H100 has 4× NVSwitch chips providing the intra-node NVLink fabric

**DGX H100 system:**
- 8× H100 SXM5 GPUs
- 4× NVSwitch chips (all-to-all fabric)
- 8× ConnectX-7 InfiniBand NDR 400 Gb/s (inter-node networking)
- 2× Intel Xeon Sapphire Rapids CPUs
- 2 TB system memory
- TDP: ~10.2 kW

---

## InfiniBand

- RDMA-native interconnect: remote direct memory access without CPU involvement
- HDR InfiniBand: 200 Gb/s per port
- NDR InfiniBand: 400 Gb/s per port
- Used for inter-node communication in GPU clusters (node-to-node, not GPU-to-GPU within a node)
- Sub-microsecond latency (< 1 µs MPI latency)
- GPUDirect RDMA: allows NIC to DMA directly to/from GPU HBM, bypassing CPU and host DRAM

**SHARP (Scalable Hierarchical Aggregation and Reduction Protocol):**
- Performs MPI AllReduce INSIDE the InfiniBand switch ASICs, not at the endpoint
- Reduces GPU/CPU overhead for collective operations
- Available on Quantum-2 InfiniBand switches
- Reduces the actual data transmitted on the fabric (tree-based reduction)

**RoCE (RDMA over Converged Ethernet):**
- RDMA capability on standard Ethernet hardware
- Lower cost than InfiniBand, slightly higher latency
- Requires Priority Flow Control (PFC) or ECN for lossless fabric
- Use when budget constrains InfiniBand deployment

---

## BlueField DPU (Data Processing Unit)

- SmartNIC with embedded ARM CPU cores, memory, and programmable networking pipeline
- Offloads from host CPU: networking (firewall, QoS, routing), storage (NVMe-oF, iSCSI), security (TLS, IPSec encryption)
- BlueField-3 specs: 400 GbE or 400 Gb/s InfiniBand, 16× ARM A78 cores, 32 GB LPDDR5
- Enables **zero-trust data center**: all traffic goes through DPU enforcement, host CPU cannot bypass
- **DPU ≠ GPU**: DPU handles infrastructure, GPU handles AI compute

---

## MIG (Multi-Instance GPU)

- Hardware partitioning of a single GPU into up to 7 isolated instances
- Each instance gets dedicated: compute (SMs), memory (HBM slice), L2 cache, memory bandwidth
- **Full fault isolation**: an error in one MIG instance does not affect others
- **Full memory isolation**: instances cannot access each other's memory
- Use case: cloud providers, university clusters — run multiple workloads/tenants on one GPU
- MIG profiles on A100 (80 GB): 1g.10gb, 2g.20gb, 3g.40gb, 4g.40gb, 7g.80gb
- MIG is NOT available on older architectures (pre-Ampere)

---

## MPS (Multi-Process Service)

- CUDA software feature allowing multiple CUDA processes to share a single GPU context
- Benefits: reduces context switch overhead when many small jobs share a GPU
- **No memory isolation**: all processes share the same GPU memory space
- **No fault isolation**: one process crashing can affect others
- Use case: trusted workloads on a single node, e.g., multiple inference workers
- MPS is compatible with most Volta and newer GPUs

---

## Slurm

- Open-source HPC workload manager for batch job scheduling
- Key concepts:
  - **Partition**: a group of compute nodes with common properties
  - **Job**: a script submitted to the queue; runs when resources become available
  - **GRES (Generic Resource Scheduling)**: how GPUs are requested — `--gres=gpu:8`
  - **QOS (Quality of Service)**: priority policies
  - **Fairshare**: historical usage affects future job priority
- `srun`, `sbatch`, `squeue`, `sinfo`: key CLI commands
- Slurm knows nothing about containers natively; Pyxis + Enroot plugin adds container support

---

## NVIDIA Base Command Platform

- End-to-end AI training platform: job submission, cluster management, data management, lifecycle
- Built on top of Slurm/Kubernetes (doesn't replace them — adds an abstraction layer)
- Features: multi-tenant job queuing, NGC integration, experiment tracking, dataset versioning
- Base Command Manager (BCM): bare-metal cluster provisioning and monitoring tool (separate from BCP)
- Use case: enterprise and cloud service providers operating shared GPU clusters

---

## Kubernetes + GPU Operator

- **NVIDIA GPU Operator**: Kubernetes operator that automates the entire GPU software stack
  - Installs GPU drivers, container runtime, device plugin, DCGM exporter, MIG manager
  - No manual driver installation on each node
- **NVIDIA Device Plugin**: exposes `nvidia.com/gpu` resource to Kubernetes scheduler
- GPU request in a pod spec: `resources: limits: nvidia.com/gpu: 2`
- Time-slicing: multiple pods can share one GPU (like MPS, no isolation)
- MIG mode in K8s: GPU Operator's MIG Manager configures MIG profiles per node

---

## BMC (Baseboard Management Controller)

- Embedded microcontroller on server motherboard, operates independently of CPU/OS
- Functions:
  - Power on/off/reset (including when OS is unresponsive)
  - Sensor monitoring: CPU/GPU temperature, fan speeds, voltage rails, power draw
  - Serial-over-LAN (SOL): console access to BIOS/OS even when OS is hung
  - Firmware updates (BIOS, BMC itself)
  - IPMI, Redfish: remote management protocols
- **Out-of-band**: communicates over dedicated management network, not production network
- DGX systems use NVIDIA-customized BMC (accessible via web UI and IPMI/Redfish)

---

## Power and Cooling Numbers

| System | TDP | Notes |
|--------|-----|-------|
| DGX A100 | 6.5 kW | 8× A100 SXM4 |
| DGX H100 | ~10.2 kW | 8× H100 SXM5 |
| A100 PCIe | 300 W | Single GPU |
| A100 SXM | 400 W | Single GPU |
| H100 PCIe | 350 W | Single GPU |
| H100 SXM5 | 700 W | Single GPU |

- High-density GPU racks (20–40+ kW/rack) require specialized cooling:
  - Rear-door heat exchangers (RDHx)
  - Direct liquid cooling (DLC) — water-cooled cold plates on GPU modules
  - Air cooling ceiling: ~20–25 kW/rack depending on CRAC capacity
- Rule of thumb: provision 2× TDP in cooling headroom for burst workloads
