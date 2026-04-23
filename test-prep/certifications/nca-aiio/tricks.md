# NCA-AIIO Distractor Patterns & Tricks Reference

This file documents the 8 core distractor patterns used in the NCA-AIIO exam. For each question generated, tag it with the relevant `trick_pattern` from this list.

---

## The 8 Core Patterns

### 1. `terminology_precision`
**Definition:** Two terms sound similar or are used interchangeably in conversation, but have precise technical distinctions the exam tests.

**Examples:**
- MIG vs MPS (both share GPUs — but MIG is hardware-isolated, MPS is not)
- NVLink vs NVSwitch (NVLink is the protocol/interconnect; NVSwitch is the switch chip)
- TensorRT vs Triton (TensorRT optimizes a model; Triton *serves* it)
- GPU vs DPU (GPU = compute; DPU = infrastructure offload)
- BF16 vs FP16 (same bit width, different exponent/mantissa split)

**How to spot in a question:** The question asks what something "primarily" does or how it "differs from" something similar.

**Defense:** Know the one-sentence definition of each NVIDIA product and don't conflate roles.

---

### 2. `tool_confusion`
**Definition:** The right tool exists for the task, but the exam presents a plausible-but-wrong alternative. Forces candidates to know WHICH tool does WHAT.

**Examples:**
- Monitoring GPU cluster health → DCGM ✓, not nvidia-smi (single GPU only)
- Optimizing model for inference → TensorRT ✓, not cuDNN (primitive library)
- Serving models at scale → Triton ✓, not TensorRT (TensorRT is an optimizer, not a server)
- Job scheduling in HPC → Slurm ✓, not Kubernetes (K8s is containers/microservices)
- Out-of-band server management → BMC ✓, not DCGM (DCGM is software/OS-level)

**Tool Confusion Matrix:**

| Task | Correct Tool | Wrong Tool (distractor) | Why Wrong |
|------|-------------|------------------------|-----------|
| Inference optimization (model → engine) | TensorRT | Triton, cuDNN | Triton serves, cuDNN is primitives |
| Inference serving at scale | Triton Inference Server | TensorRT, CUDA | TensorRT is an optimizer, not a server |
| Cluster GPU health & telemetry | DCGM | nvidia-smi | nvidia-smi is per-GPU CLI only |
| Single GPU status/debug | nvidia-smi | DCGM | DCGM is for data center scale |
| GPU collective communications | NCCL | MPI alone, InfiniBand | NCCL is the NVIDIA library; IB is fabric |
| HPC batch job scheduling | Slurm | Kubernetes, Base Command | K8s is container orchestration, not HPC |
| Container GPU setup in Kubernetes | GPU Operator | Slurm, DCGM | GPU Operator is K8s-specific |
| Out-of-band server management | BMC | DCGM, Base Command | BMC is hardware-level, OS-independent |
| Infrastructure offload (network/storage) | BlueField DPU | NIC, GPU | DPU has embedded ARM CPU for offloading |
| In-network AllReduce | SHARP | NCCL, RDMA | SHARP runs on IB switch ASICs |

---

### 3. `generation_mixup`
**Definition:** Correct concept, wrong GPU generation. Examinee knows the feature exists but assigns it to the wrong product.

**Examples:**
- FP8 support → H100 (Hopper) ✓, NOT A100 (Ampere)
- Transformer Engine → H100 ✓, NOT A100
- NVLink 4.0 (900 GB/s) → H100 ✓; NVLink 3.0 (600 GB/s) → A100
- NVLink-C2C (CPU-GPU unified memory) → Grace Hopper (GH200) only
- MIG support → A100 and H100, NOT V100

**Defense:** Anchor specs to architectures: Volta (V100) → Ampere (A100) → Hopper (H100/GH200).

---

### 4. `scope_confusion`
**Definition:** A concept is correct at one scale but wrong at the intended scope (single GPU vs node vs cluster).

**Examples:**
- nvidia-smi → correct for single GPU monitoring, WRONG for cluster-scale
- NVLink → intra-node GPU-to-GPU; InfiniBand → inter-node. Exam may ask "which connects GPU across servers?"
- NCCL AllReduce → uses InfiniBand (or NVLink for intra-node); not "GPU to GPU directly over PCIe"
- MPS → single-node, single-GPU sharing; MIG → also single GPU; neither handles cross-node

---

### 5. `protocol_mixup`
**Definition:** Multiple valid networking protocols exist, exam asks which is BEST for AI training or which handles a specific use case.

**Key distinctions:**
- **InfiniBand** → RDMA-native, lowest latency, highest bandwidth — preferred for AI training
- **RoCE (RDMA over Converged Ethernet)** → RDMA on Ethernet, slightly higher latency, lower cost
- **TCP/IP Ethernet** → highest latency, no RDMA natively — NOT recommended for tight training collectives
- **GPUDirect RDMA** → a technology (not a protocol) enabling NIC ↔ GPU direct DMA
- **NVLink** → NOT a network protocol; it's a GPU-to-GPU interconnect inside a node
- **SHARP** → in-network computing extension for AllReduce on InfiniBand; not a standalone protocol

**Common trap:** "RDMA" appears in both InfiniBand and RoCE answers — the exam wants you to pick IB when latency/performance is the criterion.

---

### 6. `role_confusion`
**Definition:** Multiple tools exist at different layers of the stack; exam tests whether you know which layer each belongs to.

**Stack layers (bottom to top):**
1. **Hardware / firmware**: BMC, DGX, NVSwitch, BlueField DPU
2. **Drivers / runtime**: CUDA driver, nvidia-container-runtime, GPU Operator
3. **Compute libraries**: cuDNN, NCCL, TensorRT (library mode)
4. **Serving layer**: Triton Inference Server
5. **Orchestration**: Slurm (HPC), Kubernetes (containers)
6. **Platform**: NVIDIA Base Command, NGC

**Common traps:**
- Base Command ≠ Slurm: Base Command is a platform built on top of Slurm/K8s, not a replacement
- GPU Operator ≠ DCGM: GPU Operator deploys drivers/plugins; DCGM monitors them
- NGC ≠ Base Command: NGC is a container/model registry; Base Command is job orchestration

---

### 7. `magnitude_trap`
**Definition:** The correct answer is a specific number and the exam uses adjacent plausible numbers as distractors.

**High-yield numbers:**
| Item | Value | Common Wrong Value |
|------|-------|-------------------|
| MIG instances on A100 | 7 max | 8 (off by one), 4 |
| Threads per warp (CUDA) | 32 | 64, 128, 16 |
| NVLink 4.0 bandwidth | 900 GB/s | 600 GB/s (that's NVLink 3.0), 1200 GB/s |
| NVLink 3.0 bandwidth | 600 GB/s | 400 GB/s, 900 GB/s |
| DGX H100 GPUs per node | 8 | 4, 16 |
| InfiniBand NDR bandwidth | 400 Gb/s | 200 Gb/s (that's HDR), 800 Gb/s |
| DGX H100 power draw | ~10.2 kW | 7 kW, 14 kW |
| A100 HBM2e memory | 80 GB | 40 GB (also valid SKU), 64 GB |

**Defense:** Memorize the table above. Don't confuse adjacent generation specs.

---

### 8. `function_inversion`
**Definition:** The correct answer correctly describes causality or the primary function; distractors reverse cause/effect or describe a secondary benefit as the primary one.

**Examples:**
- GPU advantage: "thousands of parallel cores" ✓ — NOT "faster individual cores" (CPU cores are faster individually)
- TensorRT's job: "optimize a trained model for inference" ✓ — NOT "train models faster"
- SHARP's job: "perform AllReduce in the network fabric" ✓ — NOT "compress gradients before sending" (that's gradient compression, a different technique)
- DPU's job: "offload infrastructure tasks from host CPU" ✓ — NOT "accelerate AI compute" (that's the GPU)
- NVLink advantage: "high-bandwidth intra-node GPU communication" ✓ — NOT "replacing InfiniBand for inter-node" (they serve different scopes)

---

## High-Yield Topic List (Most Frequently Tested)

Based on domain weights and past question analysis:

1. **MIG vs MPS** — hardware vs software isolation (appears in ~15% of exams)
2. **TensorRT vs Triton** — optimize vs serve (appears in ~12%)
3. **DCGM vs nvidia-smi** — cluster vs single GPU monitoring
4. **InfiniBand vs Ethernet** — for AI training fabric choice
5. **NVLink vs InfiniBand** — intra-node vs inter-node
6. **GPU parallelism fundamentals** — why GPUs beat CPUs (SIMT, Tensor Cores)
7. **DGX H100 specs** — 8× GPUs, NVLink 4.0, NVSwitch
8. **Slurm vs Kubernetes** — HPC vs container orchestration
9. **MIG partition counts** — 7 max on A100
10. **BF16 vs FP16** — same bits, different range/precision trade-off
