import Foundation
import UIKit

@objc(SystemMetrics)
class SystemMetrics: NSObject {

  // MARK: - React Native Bridge Setup

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Main Metrics Method

  @objc
  func getMetrics(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    let metrics: [String: Any] = [
      "memory": getMemoryMetrics(),
      "cpu": getCPUMetrics(),
      "threads": getThreadCount(),
      "battery": getBatteryMetrics(),
      "disk": getDiskMetrics(),
      "timestamp": Date().timeIntervalSince1970
    ]

    resolve(metrics)
  }

  // MARK: - Memory Metrics

  private func getMemoryMetrics() -> [String: Any] {
    var info = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
      $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
        task_info(mach_task_self_,
                  task_flavor_t(MACH_TASK_BASIC_INFO),
                  $0,
                  &count)
      }
    }

    guard kerr == KERN_SUCCESS else {
      return [
        "used": 0,
        "error": "Failed to get memory info"
      ]
    }

    let usedMemoryMB = Double(info.resident_size) / 1024.0 / 1024.0
    let totalMemoryMB = Double(ProcessInfo.processInfo.physicalMemory) / 1024.0 / 1024.0

    return [
      "used": usedMemoryMB,
      "total": totalMemoryMB,
      "usedBytes": info.resident_size,
      "totalBytes": ProcessInfo.processInfo.physicalMemory
    ]
  }

  // MARK: - CPU Metrics

  private func getCPUMetrics() -> [String: Any] {
    var threadList: thread_act_array_t?
    var threadCount: mach_msg_type_number_t = 0

    let kerr = task_threads(mach_task_self_, &threadList, &threadCount)

    guard kerr == KERN_SUCCESS, let threads = threadList else {
      return [
        "usage": 0.0,
        "error": "Failed to get CPU info"
      ]
    }

    var totalCPU: Double = 0

    for i in 0..<Int(threadCount) {
      var threadInfo = thread_basic_info()
      var threadInfoCount = mach_msg_type_number_t(THREAD_INFO_MAX)

      let infoKerr = withUnsafeMutablePointer(to: &threadInfo) {
        $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
          thread_info(threads[i],
                      thread_flavor_t(THREAD_BASIC_INFO),
                      $0,
                      &threadInfoCount)
        }
      }

      if infoKerr == KERN_SUCCESS {
        let cpuUsage = Double(threadInfo.cpu_usage) / Double(TH_USAGE_SCALE)
        totalCPU += cpuUsage * 100.0
      }
    }

    // Deallocate thread list
    vm_deallocate(mach_task_self_,
                  vm_address_t(bitPattern: threads),
                  vm_size_t(Int(threadCount) * MemoryLayout<thread_t>.stride))

    return [
      "usage": totalCPU,
      "threadCount": Int(threadCount)
    ]
  }

  // MARK: - Thread Count

  private func getThreadCount() -> Int {
    var threadList: thread_act_array_t?
    var threadCount: mach_msg_type_number_t = 0

    let kerr = task_threads(mach_task_self_, &threadList, &threadCount)

    if kerr == KERN_SUCCESS, let threads = threadList {
      vm_deallocate(mach_task_self_,
                    vm_address_t(bitPattern: threads),
                    vm_size_t(Int(threadCount) * MemoryLayout<thread_t>.stride))
      return Int(threadCount)
    }

    return 0
  }

  // MARK: - Battery Metrics

  private func getBatteryMetrics() -> [String: Any] {
    UIDevice.current.isBatteryMonitoringEnabled = true

    let batteryLevel = UIDevice.current.batteryLevel
    let batteryState = UIDevice.current.batteryState

    var stateString = "unknown"
    switch batteryState {
    case .unplugged:
      stateString = "unplugged"
    case .charging:
      stateString = "charging"
    case .full:
      stateString = "full"
    default:
      stateString = "unknown"
    }

    return [
      "level": batteryLevel >= 0 ? Double(batteryLevel) * 100.0 : -1.0,
      "state": stateString,
      "isCharging": batteryState == .charging || batteryState == .full
    ]
  }

  // MARK: - Disk Metrics

  private func getDiskMetrics() -> [String: Any] {
    guard let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first else {
      return [
        "error": "Failed to get document directory"
      ]
    }

    do {
      let systemAttributes = try FileManager.default.attributesOfFileSystem(forPath: path)

      guard let totalSpace = systemAttributes[.systemSize] as? NSNumber,
            let freeSpace = systemAttributes[.systemFreeSize] as? NSNumber else {
        return [
          "error": "Failed to get disk attributes"
        ]
      }

      let totalGB = Double(truncating: totalSpace) / 1024.0 / 1024.0 / 1024.0
      let freeGB = Double(truncating: freeSpace) / 1024.0 / 1024.0 / 1024.0
      let usedGB = totalGB - freeGB

      return [
        "total": totalGB,
        "free": freeGB,
        "used": usedGB,
        "totalBytes": totalSpace,
        "freeBytes": freeSpace,
        "usedBytes": NSNumber(value: totalSpace.int64Value - freeSpace.int64Value)
      ]
    } catch {
      return [
        "error": "Failed to get disk metrics: \(error.localizedDescription)"
      ]
    }
  }
}
